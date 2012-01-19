'use strict';

var noop = require('es5-ext/lib/Function/noop')

  , x = {}, y = {}, e = new Error("Error");

module.exports = {
	"Then callback run in current tick": function (t, a) {
		var next = false;
		t(null)(function (result) {
			a(next, false);
		}, a.never).end();
		next = true;
	},
	"Call all then callbacks in order": function (t, a, d) {
		var promise = t(), x = {}, count = 0;
		promise(function (result) {
			++count;
		}, a.never).end();
		promise(function (result) {
			a(count, 1); d();
		}, a.never).end();
		promise._base.resolve(x);
	},
	"Resolve promise with other promise": function (t, a, d) {
		var p1 = t(), x = {}, p2 = t();
		p1(function (result) {
			a(result, x); d();
		}, a.never).end();
		p1._base.resolve(p2);
		p2._base.resolve(x);
	},
	"Reject": function (t, a, d) {
		t(e)(a.never, function (res) {
			a(res, e); d();
		}).end();
	},
	"Erroneous callback rejects promise": function (t, a, d) {
		t(1)(function () {
			throw e;
		})(a.never, function (res) {
			a(res, e); d();
		}).end();
	},
	"Object promise resolves to same object": function (t, a, d) {
		t(x)(function (result) {
			a(result, x); d();
		}, a.never).end();
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a(t(p), p);
	},
	"Front": {
		"End": function (t, a) {
			a(t(x).end(), undefined);
		},
		"ValueOf": function (t, a) {
			var y = t();
			a(y.valueOf(), y, "Unresolved");
			y._base.resolve(x);
			a(y.valueOf(), x, "Resolved");
		}
	},
	"Back": {
		"Then": {
			"Callback": function (t, a, d) {
				t(x)(function (result) {
					a(result, x); d();
				}, a.never).end();
			},
			"Null": function (t, a, d) {
				t(x)(null, a.never)(function (result) {
					a(result, x); d();
				}, a.never).end();
			},
			"Other value": function (t, a, d) {
				t(x)(y, a.never)(function (result) {
					a(result, y); d();
				}, a.never).end();
			},
			"Error": function (t, a, d) {
				t(e)(a.never, function (result) {
					a(result, e); d();
				}).end();
			}
		},
		"End": {
			"No args": {
				"Success": function (t, a) {
					a(t(null).end(), undefined);
				},
				"Error": function (t, a) {
					a.throws(function () {
						t(e).end();
					});
				}
			},
			"One arg": {
				"Success": function (t, a) {
					t(x).end(function (err, res) {
						a(err, null, "Error");
						a(res, x, "Result");
					});
				},
				"Error": function (t, a) {
					t(e).end(function (err, res) {
						a(err, e, "Error");
						a(res, undefined, "Result");
					});
				}
			},
			"Two args": {
				"Success": function (t, a) {
					t(x).end(function (res) {
						a(res, x, "Result");
					}, a.never);
				},
				"Error": function (t, a) {
					t(e).end(a.never, function (err) {
						a(err, e, "Error");
					});
				}
			}
		}
	}
};
