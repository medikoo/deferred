'use strict';

var deferred = require('../../../lib/deferred')
  , promise  = require('../../../lib/promise');

module.exports = function (t) {
	var x = {}, y = {}, z = {}, e = new Error("Error")
	  , arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return {
		"Empty": {
			"": function (a, d) {
				t.call([])(function (result) {
					a.deep(result, []);
				}, a.never).end(d);
			},
			"Callback": function (a, d) {
				t.call([], a.never)(function (result) {
					a.deep(result, []);
				}, a.never).end(d);
			}
		},
		"One": {
			"Value": {
				"": function (a, d) {
					t.call([x])(function (result) {
						a.deep(result, [x]);
					}, a.never).end(d);
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
						a.deep(result, [y]);
					}, a.never).end(d);
				}
			},
			"Promise": {
				"": function (a, d) {
					t.call([promise(x)])(function (result) {
						a.deep(result, [x]);
					}, a.never).end(d);
				},
				"Callback": function (a, d) {
					t.call([promise(x)], function (arg) {
						a(arg, x, "Argument");
						return y;
					})(function (result) {
						a.deep(result, [y]);
					}, a.never).end(d);
				}
			}
		},
		"Many": {
			"No callback": {
				"Error": function (a, d) {
					t.call([x, y, promise(x), e, z])(a.never, function (res) {
						a(res, e);
						d();
					});
				},
				"Values & Promises": function (a, d) {
					t.call([x, y, promise(x), z, promise(y)])(function (res) {
						a.deep(res, [x, y, x, z, y]);
					}, a.never).end(d);
				},
				"Error promise": function (a, d) {
					t.call([x, y, promise(e), z, promise(y)])(a.never, function (res) {
						a(res, e);
					}, a.never).end(d);
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
						a(res, e);
					}).end(d);
				},
				"Error via input": function (a, d) {
					var count = 0;
					t.call([x, y, promise(e), z], function (res) {
						return x;
					})(a.never, function (res) {
						a(res, e);
					}).end(d);
				},
				"Values & Promises": function (a, d) {
					t.call([1, promise(2), 3, promise(4), 5], function (val) {
						return val * val;
					})(function (res) {
						a.deep(res, [1, 4, 9, 16, 25]);
					}, a.never).end(d);
				},
				"Values & Promises, through promise": function (a, d) {
					t.call([1, promise(2), 3, promise(4), 5], function (val) {
						return promise(val * val);
					})(function (res) {
						a.deep(res, [1, 4, 9, 16, 25]);
					}, a.never).end(d);
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
		},
		"Limited": {
			"Waiting": function (a) {
				var count = 0, ps = [], res = 1, p;
				p = t.call(arr, function (item, index, list) {
					a(item, count + 1, "Item");
					a(index, count, "Index");
					a(list, arr, "List");
					a(this, x, "Context");
					++count;
					var d = deferred();
					ps.push(d.resolve);
					return d.promise;
				}, x, 3);
				a(count, 3, "Limit");
				ps.shift()(res = res + res);
				a(count, 4, "Limit");
				ps.shift()(res = res + res);
				a(count, 5, "Limit");
				while (ps.length) {
					ps.shift()(res = res + res);
				}
				a(count, 10, "All run");
				p(function (res) {
					a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
				}).end();
			},
			"Synchronous": function (a) {
				var count = 0, res = 1;
				t.call(arr, function (item, index, list) {
					a(item, count + 1, "Item");
					a(index, count, "Index");
					a(list, arr, "List");
					a(this, x, "Context");
					++count;
					return (res = res + res);
				}, x, 3)(function (res) {
					a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
				}).end();
			},
			"Synchronous promises": function (a) {
				var count = 0, res = 1;
				t.call(arr, function (item, index, list) {
					a(item, count + 1, "Item");
					a(index, count, "Index");
					a(list, arr, "List");
					a(this, x, "Context");
					++count;
					return promise(res = res + res);
				}, x, 3)(function (res) {
					a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
				}).end();
			}
		}
	};
};
