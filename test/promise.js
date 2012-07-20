'use strict';

var noop     = require('es5-ext/lib/Function/noop')
  , deferred = require('../lib/deferred')

  , x = {}, y = {}, e = new Error("Error");

module.exports = {
	"Then callback run in current tick": function (t, a) {
		var next = false;
		t(null)(function (result) {
			a(next, false);
		}, a.never).end();
		next = true;
	},
	"Reject": function (t, a, d) {
		t(e)(a.never, function (res) {
			a(res, e);
		}).end(d);
	},
	"Erroneous callback rejects promise": function (t, a, d) {
		t(1)(function () {
			throw e;
		})(a.never, function (res) {
			a(res, e);
		}).end(d);
	},
	"Object promise resolves to same object": function (t, a, d) {
		t(x)(function (result) {
			a(result, x);
		}, a.never).end(d);
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
			}, a.never).end(d);
		},
		"Null": function (t, a, d) {
			t(x)(null, a.never)(function (result) {
				a(result, x);
			}, a.never).end(d);
		},
		"Other value": function (t, a, d) {
			t(x)(y, a.never)(function (result) {
				a(result, y);
			}, a.never).end(d);
		},
		"Error": function (t, a, d) {
			t(e)(a.never, function (result) {
				a(result, e);
			}).end(d);
		},
		"Chain promise & resolve with function": function (t, a) {
			var d1 = deferred(), fn = function () { return 'bar' };
			d1.promise(t('foo')).end(function (res) {
				a(res, 'foo', "Unresolved");
			}, null);
			d1.resolve(fn);
			var p1 = t(2);
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
		},
		"Two args, second null": {
			"Success": function (t, a) {
				t(x).end(function (res) {
					a(res, x, "Result");
				}, null);
			},
			"Error": function (t, a) {
				a.throws(function () {
					t(e).end(a.never, null);
				});
			}
		}
	}
};
