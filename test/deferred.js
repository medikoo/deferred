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
		var defer = t(), x = new Error('Test error');
		defer.resolve(1);
		defer.promise(function () {
			throw x;
		}).end(function (e) {
			a(e, x); d();
		});
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
	}
};
