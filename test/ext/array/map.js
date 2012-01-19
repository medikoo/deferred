'use strict';

var deferred = require('../../../lib/deferred')
  , promise  = require('../../../lib/promise');

module.exports = function (t) {
	var x = {}, y = {}, z = {}, e = new Error("Error");
	return {
		"Empty": {
			"": function (a, d) {
				t.call([])(function (result) {
					a.deep(result, []); d();
				}, a.never);
			},
			"Callback": function (a, d) {
				t.call([], a.never)(function (result) {
					a.deep(result, []); d();
				}, a.never);
			}
		},
		"One": {
			"Value": {
				"": function (a, d) {
					t.call([x])(function (result) {
						a.deep(result, [x]); d();
					}, a.never);
				},
				"Callback": function (a, d) {
					var list = [x];
					t.call(list, function (arg, index, target) {
						a(arg, x, "Argument");
						a(index, 0, "Index");
						a(target, list, "Target");
						a(this, x, "Context");
						return y;
					}, x)(function (result) {
						a.deep(result, [y]); d();
					}, a.never);
				}
			},
			"Promise": {
				"": function (a, d) {
					t.call([promise(x)])(function (result) {
						a.deep(result, [x]); d();
					}, a.never);
				},
				"Callback": function (a, d) {
					t.call([promise(x)], function (arg) {
						a(arg, x, "Argument");
						return y;
					})(function (result) {
						a.deep(result, [y]); d();
					}, a.never);
				}
			}
		},
		"Many": {
			"No callback": {
				"Error": function (a, d) {
					t.call([x, y, promise(x), e, z])(a.never, function (res) {
						a(res, e); d();
					});
				},
				"Values & Promises": function (a, d) {
					t.call([x, y, promise(x), z, promise(y)])(function (res) {
						a.deep(res, [x, y, x, z, y]); d();
					}, a.never);
				},
				"Error promise": function (a, d) {
					t.call([x, y, promise(e), z, promise(y)])(a.never, function (res) {
						a(res, e); d();
					}, a.never);
				}
			},
			"Callback": {
				"Error": function (a, d) {
					var count = 0;
					t.call([x, y, promise(x), z], function () {
						if (count++) {
							a.never();
						}
						return e;
					})(a.never, function (res) {
						a(res, e); d();
					});
				},
				"Error via input": function (a, d) {
					var count = 0;
					t.call([x, y, promise(e), z], function (res) {
						return x;
					})(a.never, function (res) {
						a(res, e); d();
					});
				},
				"Values & Promises": function (a, d) {
					t.call([1, promise(2), 3, promise(4), 5], function (val) {
						return val*val;
					})(function (res) {
						a.deep(res, [1, 4, 9, 16, 25]); d();
					}, a.never);
				},
				"Values & Promises, through promise": function (a, d) {
					t.call([1, promise(2), 3, promise(4), 5], function (val) {
						return promise(val*val);
					})(function (res) {
						a.deep(res, [1, 4, 9, 16, 25]); d();
					}, a.never);
				}
			}
		},
		"Resolve not via then": function (a) {
			// With v0.3.0 we introduced a bug - resolve of map in some cases was
			// called within callback passed to then, therefore any following errors
			// in given event loop were silent - this test makes sure it's not the
			// case anymore

			var d = deferred();
			t.call([d.promise]).end(function () {
				throw new Error("ERROR");
			});
			a.throws(d.resolve);
		}
	};
};
