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
	"Object promise resolves to same object": function (t, a, d) {
		var x = {};
		t(x)(function (result) {
			a(result, x); d();
		}, a.never).end();
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a(t(p), p);
	},
	"Error returns rejected promise": function (t, a, d) {
		var x = new Error('Test');
		t(x)(a.never, function (e) {
			a(e, x); d();
		}).end();
	},
	"End": function (t, a, d) {
		var defer = t(), x = new Error('Test error'), p;
		defer.resolve(1);
		p = defer.promise(function () {
			throw x;
		});
		a(p.end(function (e) {
			a(e, x); d();
		}), p, "Returns self promise");
	},
	"ValueOf": function (t, a) {
		var defer = t(), x = {};
		a(defer.promise.valueOf(), defer.promise, "Unresolved");
		defer.resolve(x);
		a(defer.promise.valueOf(), x, "Resolved");
	}
};
