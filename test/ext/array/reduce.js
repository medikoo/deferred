'use strict';

var deferred = require('../../../lib/deferred')
  , promise  = require('../../../lib/promise');

module.exports = function (t) {
	var x = {}, y = {}, z = {}, e = new Error("Error"), e2 = new Error("Error2");

	return {
		"Empty": {
			"No initial": function (a) {
				a.throws(function () {
					t.call([]);
				});
				a.throws(function () {
					t.call([], function () {
						return x;
					});
				});
			},
			"Initial": {
				"": function (a, d) {
					t.call([], null, x)(function (res) {
						a(res, x);
					}, a.never).end(d);
				},
				"Undefined": function (a, d) {
					t.call([], null, undefined)(function (res) {
						a(res, undefined);
					}, a.never).end(d);
				},
				"Callback": function (a, d) {
					t.call([], a.never, x)(function (res) {
						a(res, x);
					}, a.never).end(d);
				},
				"Promise": function (a, d) {
					t.call([], a.never, promise(y))(function (res) {
						a(res, y);
					}, a.never).end(d);
				},
				"Error": function (a, d) {
					t.call([], a.never, e)(a.never, function (res) {
						a(res, e);
					}).end(d);
				}
			}
		},
		"One": {
			"No initial": {
				"Regular": {
					"": function (a, d) {
						t.call([x])(function (res) {
							a(res, x);
						}, a.never).end(d);
					},
					"Callback": {
						"": function (a, d) {
							var list = [x];
							t.call(list, a.never)(function (res) {
								a(res, x);
							}, a.never).end(d);
						},
						"Promise": function (a, d) {
							t.call([x], a.never)(function (res) {
								a(res, x);
							}, a.never).end(d);
						},
						"Throw Error": function (a, d) {
							t.call([x], function (acc, arg) {
								throw e;
							}, null)(a.never, function (res) {
								a(res, e);
							}).end(d);
						},
						"Return Error": function (a, d) {
							t.call([promise(e)], function (acc, arg) {
								return e;
							}, null)(a.never, function (res) {
								a(res, e);
							}).end(d);
						}
					}
				},
				"Promise": {
					"": function (a, d) {
						t.call([promise(x)])(function (res) {
							a(res, x);
						}, a.never).end(d);
					},
					"Callback": function (a, d) {
						t.call([promise(x)], function (acc, arg) {
							a(acc, null, "Accumulator");
							a(arg, x, "Argument");
							return y;
						}, null)(function (res) {
							a(res, y);
						}, a.never).end(d);
					}
				},
				"Undefined": function (a, d) {
					t.call([undefined])(function (res) {
						a(res, undefined);
					}, a.never).end(d);
				},
				"Error": {
					"": function (a, d) {
						t.call([e])(a.never, function (res) {
							a(res, e);
						}, a.never).end(d);
					},
					"Promise": function (a, d) {
						t.call([promise(e)])(a.never, function (res) {
							a(res, e);
						}, a.never).end(d);
					},
					"Callback": {
						"": function (a, d) {
							t.call([e], function (acc, arg) {
								a(acc, null, "Accumulator");
								a(arg, e, "Argument");
								return y;
							}, null)(function (res) {
								a(res, y);
							}, a.never).end(d);
						},
						"Promise": function (a, d) {
							t.call([promise(e)], a.never)(a.never, function (res) {
								a(res, e);
							}).end(d);
						},
						"Throw Error": function (a, d) {
							var e2 = new Error("Error");
							t.call([e], function (acc, arg) {
								a(arg, e, "Argument");
								throw e2;
							}, null)(a.never, function (res) {
								a(res, e2);
							}).end(d);
						},
						"Return Error": function (a, d) {
							var e2 = new Error("Error");
							t.call([e], function (acc, arg) {
								a(arg, e, "Argument");
								return e2;
							}, null)(a.never, function (res) {
								a(res, e2);
							}).end(d);
						}
					}
				}
			},
			"Initial": {
				"Regular": {
					"": function (a, d) {
						t.call([x], null, y)(function (res) {
							a(res, x);
						}, a.never).end(d);
					},
					"Initial Error": function (a, d) {
						t.call([x], a.never, e)(a.never, function (res) {
							a(res, e);
						}).end(d);
					},
					"Callback": {
						"": function (a, d) {
							t.call([x], function (acc, arg) {
								a(acc, z, "Accumulator");
								a(arg, x, "Argument");
								return y;
							}, z)(function (res) {
								a(res, y);
							}, a.never).end(d);
						}
					}
				},
				"Promise": {
					"": function (a, d) {
						t.call([promise(x)], null, promise(y))(function (res) {
							a(res, x);
						}, a.never).end(d);
					},
					"Callback": function (a, d) {
						t.call([promise(x)], function (acc, arg) {
							a(acc, z, "Accumulator");
							a(arg, x, "Argument");
							return promise(y);
						}, promise(z))(function (res) {
							a(res, y);
						}, a.never).end(d);
					}
				},
				"Undefined": function (a, d) {
					t.call([undefined], null, z)(function (res) {
						a(res, undefined);
					}, a.never).end(d);
				}
			}
		},
		"Many": {
			"Initial error": function (a, d) {
				t.call([x, y, z], a.never, e)(a.never, function (res) {
					a(res, e);
				}).end(d);
			},
			"No callback": {
				"Error": function (a, d) {
					t.call([x, e, e2])(a.never, function (res) {
						a(res, e);
					}).end(d);
				},
				"Error promise": function (a, d) {
					t.call([x, promise(e), e2])(a.never, function (res) {
						a(res, e);
					}).end(d);
				},
				"Values": function (a, d) {
					t.call([x, y, z])(function (res) {
						a(res, z);
					}, a.never).end(d);
				},
				"Values & Promises": function (a, d) {
					t.call([x, promise(y), z])(function (res) {
						a(res, z);
					}, a.never).end(d);
				},
				"Values & Promises & Initial": function (a, d) {
					t.call([x, promise(y), z], null, {})(function (res) {
						a(res, z);
					}, a.never).end(d);
				}
			},
			"Callback": {
				"Error": function (a, d) {
					t.call([x, e, e2], function (acc, res) {
						return z;
					})(function (res) {
						a(res, z);
					}, a.never).end(d);
				},
				"Error promise": function (a, d) {
					t.call([x, promise(e), e2], function () {
						return z;
					})(a.never, function (res) {
						a(res, e);
					}).end(d);
				},
				"Values": function (a, d) {
					t.call([1, 2, 3], function (acc, res) {
						return acc * res;
					}, 1)(function (res) {
						a(res, 6);
					}, a.never).end(d);
				},
				"Values & Promises": function (a, d) {
					t.call([1, promise(2), 3], function (acc, res) {
						return promise(acc * res);
					}, promise(1))(function (res) {
						a(res, 6);
					}, a.never).end(d);
				}
			}
		}
	};
};
