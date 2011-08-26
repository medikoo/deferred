'use strict';

var noop = require('es5-ext/lib/Function/noop');

module.exports = {
	"Pass resolved value to then": function (t, a, d) {
		var defer = t(), x = {};
		defer.resolve(x)(function (result) {
			a(result, x); d();
		}, a.never).end();
	},
	"Then callback run in next tick": function (t, a, d) {
		var defer = t(), x = {}, invoked = false;
		defer.resolve(x).then(function (result) {
			invoked = true; d();
		}, a.never).end();
		a(invoked, false);
	},
	"Call all then callbacks in order": function (t, a, d) {
		var defer = t(), x = {}, count = 0;
		defer.promise(function (result) {
			++count;
		}, a.never).end();
		defer.promise(function (result) {
			a(count, 1); d();
		}, a.never).end();
		defer.resolve(x);
	},
	"Resolve promise with other promise": function (t, a, d) {
		var defer = t(), x = {}, d2 = t();
		defer.promise(function (result) {
			a(result, x); d();
		}, a.never).end();
		defer.resolve(d2.promise);
		d2.resolve(x);
	},
	"Reject": function (t, a, d) {
		var defer = t(), x = new Error('Test error'), count = 0;
		defer.resolve(x)(a.never, function (e) {
			a(x, e); d();
		}).end();
	},
	"Error on second resolve": function (t, a) {
		var defer = t();
		defer.promise.end();
		defer.resolve(1);
		a.throws(function () {
			defer.resolve(2);
		});
	},
	"Erroneous callback rejects promise": function (t, a, d) {
		var defer = t(), x = new Error('Test error');
		defer.resolve(1);
		defer.promise(function () {
			throw x;
		})(a.never, function (e) {
			a(e, x); d();
		}).end();
	},
	"Error handler in end": function (t, a, d) {
		var defer = t(), x = new Error('Test error'), p;
		defer.resolve(1);
		p = defer.promise(function () {
			throw x;
		});
		a(p.end(function (e) {
			a(e, x); d();
		}), p, "Returns self promise");
	},
	"Prevent double then callbacks with alien promise": function (t, a, d) {
		var defer = t(), count = 0;
		defer.promise.then(function () {
			++count;
		});
		defer.resolve({ then: function (callback) {
			callback(); callback();
			a(count, 1); d();
		}, end: noop});
		defer.promise.end();
	},
	"Regular async callback": function (t, a, d) {
		var defer = t(), x = {};
		defer.resolve(x);
		a(defer.promise.cb(function (err, res) {
			a(err, null, "Error object is null");
			a(res, x); d();
		}), undefined, "Does not return anything");
	},
	"Regular async callback, error": function (t, a, d) {
		var defer = t(), x = new Error('Error');
		defer.resolve(x);
		defer.promise.cb(function (err, res) {
			a(err, x);
			a(res, null, "Result is null"); d();
		});
	},
	"Join": function (t, a, d) {
		var defer = t(), x = 0, e = new Error();
		defer.resolve([1,2,3]).join(function (y) {
			return y == 1 ? e : y;
		})
		(function (r) {
			a.deep(r, [e, 2, 3]); d();
		}, d).end();
	},
	"First": function (t, a, d) {
		var defer = t(), x = 0;
		defer.resolve([1,2,3]).first(function (y) {
			return y == 1 ? new Error() : y;
		})
		(function (r) {
			a(r, 2); d();
		}, d).end();
	},
	"All": {
		"": function (t, a, d) {
			var defer = t(), x = 0
			defer.resolve([1,2,3]).all(function (y) {
				return x += y;
			})
			(function (r) {
				a.deep(r, [1, 3, 6]); d();
			}, d).end();
		},
		"Error": function (t, a, d) {
			var defer = t(), x = 0, e = new Error();
			defer.resolve([1,2,3]).all(function (y) {
				return y == 1 ? e : y;
			})
			(a.never, function (r) {
				a(r, e); d();
			}).end();
		}
	}
};
