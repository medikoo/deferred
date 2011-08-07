'use strict';

var deferred = require('../../lib/deferred')
  , promise  = require('../../lib/promise');

module.exports = {
	"Array as argument": function (t, a) {
		var x = {}, y = {};
		var p = Object.create(t).init([[promise(x), promise(y)]]);

		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					// console.log("RUN THEN", r);
					a(r.length, 2); d();
				}, a.never).end();
			},
			"Result #1 matches promise #1": function (t, a, d) {
				p(function (r) {
					a(x, r[0]); d();
				}, a.never).end();
			},
			"Result #2 matches promise #2": function (t, a, d) {
				p(function (r) {
					a(y, r[1]); d();
				}, a.never).end();
			}
		};
	},
	"Promises": function (t, a) {
		var x = {}, y = {}, z = {};
		var d = deferred();
		var p = Object.create(t).init([promise(x), d.promise, promise(z)]);
		d.resolve(promise(y));
		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					a(r.length, 3); d();
				}, a.never).end();
			},
			"Result #1 matches promise #1": function (t, a, d) {
				p(function (r) {
					a(x, r[0]); d();
				}, a.never).end();
			},
			"Result #2 matches nested promise #2": function (t, a, d) {
				p(function (r) {
					a(y, r[1]); d();
				}, a.never).end();
			},
			"Result #3 matches promise #3": function (t, a, d) {
				p(function (r) {
					a(z, r[2]); d();
				}, a.never).end();
			}
		};
	},
	"Functions": function (t, a) {
		var x = {}, y = {}, xy;
		var p = Object.create(t).init([function () {
			return x;
		}, function (r) {
			xy = r;
			return y;
		}]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					a(r.length, 2); d();
				}, a.never).end();
			},
			"Function #2 get result of function #1": function (t, a, d) {
				p(function (r) {
					a(xy, x); d();
				}, a.never).end();
			},
			"Result #1 matches result of function #1": function (t, a, d) {
				p(function (r) {
					a(x, r[0]); d();
				}, a.never).end();
			},
			"Result #2 matches result of function  #2": function (t, a, d) {
				p(function (r) {
					a(y, r[1]); d();
				}, a.never).end();
			}
		};
	},
	"Promise & function": function (t, a) {
		var w = {}, x = {}, y = {}, z = {}, x2, y2;
		var p = Object.create(t).init([function () {
			return promise(w);
		}, promise(x), function (r) {
			x2 = r;
			return promise(y);
		}, function (r) {
			y2 = r;
			return z;
		}]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					a(r.length, 4); d();
				}, a.never).end();
			},
			"Function get result of preceding promise": function (t, a, d) {
				p(function (r) {
					a(x2, x); d();
				}, a.never).end();
			},
			"Result #1 matches result of promise returned by function being first argument": function (t, a, d) {
				p(function (r) {
					a(w, r[0]); d();
				}, a.never).end();
			},
			"Result #2 matches result of promise": function (t, a, d) {
				p(function (r) {
					a(x, r[1]); d();
				}, a.never).end();
			},
			"Result #3 matches result of promise returned by function": function (t, a, d) {
				p(function (r) {
					a(y, r[2]); d();
				}, a.never).end();
			},
			"Result #4 matches result of function": function (t, a, d) {
				p(function (r) {
					a(z, r[3]); d();
				}, a.never).end();
			}
		};
	},
	"Any object": function (t, a) {
		var x = {}, y = {}, xy;
		var p = Object.create(t).init([x, function (r) {
			xy = r;
			return {};
		}, y]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					a(r.length, 3); d();
				}, a.never).end();
			},
			"Function get result of preceding object": function (t, a, d) {
				p(function (r) {
					a(xy, x); d();
				}, a.never).end();
			},
			"Result #1 matches passed object": function (t, a, d) {
				p(function (r) {
					a(x, r[0]); d();
				}, a.never).end();
			},
			"Result #3 matches passed object": function (t, a, d) {
				p(function (r) {
					a(y, r[2]); d();
				}, a.never).end();
			}
		};
	},
	"Error": function (t, a) {
		var e = new Error('Test'), x = {};
		var p = Object.create(t).init(
			[promise(e), a.never, promise(x)]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p(function (r) {
					a(r.length, 3); d();
				}, a.never).end();
			},
			"One of results is error": function (t, a, d) {
				p(function (r) {
					a(r[0], e); d();
				}).end();
			},
			"Function following erroneus value turns into same error in result": function (t, a, d) {
				p(function (r) {
					a(r[1], e); d();
				}).end();
			},
			"Promise argument turns to value": function (t, a, d) {
				p(function (r) {
					a(r[2], x); d();
				}).end();
			}
		};
	},
	"Resolve before reading all arguments": function (t, a, d) {
		var base = Object.create(t);
		base.resolveItem = function (i, r) {
			this.resolved.all = true;
			this.deferred.resolve(r);
			delete base.resolveItem;
		};

		var x = {}, y = {}, z = {};
		var p = Object.create(base).init([promise(x), y, promise(z)]);
		p(function (r) {
			a(r, y); d();
		});
	}
};
