'use strict';

var deferred = require('../lib/deferred')

  , x = {}, y = {}, e = new Error("Error");

module.exports = {
	"Then callback run in current tick": function (t, a) {
		var next = false;
		t(null)(function () {
			a(next, false);
		}, a.never).end();
		next = true;
	},
	"Reject": function (t, a, d) {
		t(e)(a.never, function (res) {
			a(res, e);
		}).end(d, d);
	},
	"Erroneous callback rejects promise": function (t, a, d) {
		t(1)(function () {
			throw e;
		})(a.never, function (res) {
			a(res, e);
		}).end(d, d);
	},
	"Object promise resolves to same object": function (t, a, d) {
		t(x)(function (result) {
			a(result, x);
		}, a.never).end(d, d);
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a(t(p), p);
	},
	"ValueOf": function (t, a) {
		var def = deferred(), y = def.promise;
		a(y.valueOf(), y, "Unresolved");
		def.resolve(x);
		a(y.valueOf(), x, "Resolved");
	},
	"Then": {
		"Callback": function (t, a, d) {
			t(x)(function (result) {
				a(result, x);
			}, a.never).end(d, d);
		},
		"Null": function (t, a, d) {
			t(x)(null, a.never)(function (result) {
				a(result, x);
			}, a.never).end(d, d);
		},
		"Other value": function (t, a, d) {
			t(x)(y, a.never)(function (result) {
				a(result, y);
			}, a.never).end(d, d);
		},
		"Error": function (t, a, d) {
			t(e)(a.never, function (result) {
				a(result, e);
			}).end(d, d);
		},
		"Chain promise & resolve with function": function (t, a) {
			var d1, fn, p1;
			d1 = deferred();
			fn = function () { return 'bar'; };
			d1.promise(t('foo')).end(function (res) {
				a(res, 'foo', "Unresolved");
			});
			d1.resolve(fn);
			p1 = t(2);
			a(t(1)(p1), p1, "Resolved");
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
		"Args": {
			"Success": function (t, a) {
				t(x).end(function (res) {
					a(res, x, "Result");
				}, a.never);
			},
			"Error": function (t, a) {
				t(e).end(a.never, function (err) {
					a(err, e, "Error");
				});
			},
			"Success #2": function (t, a) {
				t(x).end(function (res) {
					a(res, x, "Result");
				}, null);
			},
			"Error: Throw": function (t, a) {
				a.throws(function () {
					t(e).end(a.never, null);
				});
			}
		}
	}
};
