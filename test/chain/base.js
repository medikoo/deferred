'use strict';

var neverCalled = require('tad/lib/utils/never-called')

  , promise     = require('../../lib/promise');

module.exports = {
	"Promises": function (t, a) {
		var x = {}, y = {};
		var p = Object.create(t).init([promise(x), promise(y)]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p.then(function (r) {
					// console.log("RUN THEN", r);
					a.equal(r.length, 2); d();
				}, neverCalled(a)).end();
			},
			"Result #1 matches promise #1": function (t, a, d) {
				p.then(function (r) {
					a.equal(x, r[0]); d();
				}, neverCalled(a)).end();
			},
			"Result #2 matches promise #2": function (t, a, d) {
				p.then(function (r) {
					a.equal(y, r[1]); d();
				}, neverCalled(a)).end();
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
				p.then(function (r) {
					a.equal(r.length, 2); d();
				}, neverCalled(a)).end();
			},
			"Function #2 get result of function #1": function (t, a, d) {
				p.then(function (r) {
					a.equal(xy, x); d();
				}, neverCalled(a)).end();
			},
			"Result #1 matches result of function #1": function (t, a, d) {
				p.then(function (r) {
					a.equal(x, r[0]); d();
				}, neverCalled(a)).end();
			},
			"Result #2 matches result of function  #2": function (t, a, d) {
				p.then(function (r) {
					a.equal(y, r[1]); d();
				}, neverCalled(a)).end();
			}
		};
	},
	"Promise & function": function (t, a) {
		var x = {}, y = {}, xy;
		var p = Object.create(t).init([promise(x), function (r) {
			xy = r;
			return y;
		}]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p.then(function (r) {
					a.equal(r.length, 2); d();
				}, neverCalled(a)).end();
			},
			"Function get result of preceding promise": function (t, a, d) {
				p.then(function (r) {
					a.equal(xy, x); d();
				}, neverCalled(a)).end();
			},
			"Result #1 matches result of promise": function (t, a, d) {
				p.then(function (r) {
					a.equal(x, r[0]); d();
				}, neverCalled(a)).end();
			},
			"Result #2 matches result of function": function (t, a, d) {
				p.then(function (r) {
					a.equal(y, r[1]); d();
				}, neverCalled(a)).end();
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
				p.then(function (r) {
					a.equal(r.length, 3); d();
				}, neverCalled(a)).end();
			},
			"Function get result of preceding object": function (t, a, d) {
				p.then(function (r) {
					a.equal(xy, x); d();
				}, neverCalled(a)).end();
			},
			"Result #1 matches passed object": function (t, a, d) {
				p.then(function (r) {
					a.equal(x, r[0]); d();
				}, neverCalled(a)).end();
			},
			"Result #3 matches passed object": function (t, a, d) {
				p.then(function (r) {
					a.equal(y, r[2]); d();
				}, neverCalled(a)).end();
			}
		};
	},
	"Error": function (t, a) {
		var e = new Error('Test'), x = {};
		var p = Object.create(t).init(
			[promise(e), neverCalled(a), promise(x)]);
		return {
			"Result length matches chain length": function (t, a, d) {
				p.then(function (r) {
					a.equal(r.length, 3); d();
				}, neverCalled(a)).end();
			},
			"One of results is error": function (t, a, d) {
				p.then(function (r) {
					a.equal(r[0], e); d();
				}).end();
			},
			"Function following erroneus value turns into same error in result": function (t, a, d) {
				p.then(function (r) {
					a.equal(r[1], e); d();
				}).end();
			},
			"Promise argument turns to value": function (t, a, d) {
				p.then(function (r) {
					a.equal(r[2], x); d();
				}).end();
			}
		};
	}
};
