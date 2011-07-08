'use strict';

var noop        = require('es5-ext/lib/Function/noop')
  , neverCalled = require('tad/lib/utils/never-called');

module.exports = {
	"Pass resolved value to then": function (t, a, d) {
		var defer = t(), x = {};
		defer.resolve(x);
		defer.promise.then(function (result) {
			a.equal(result, x); d();
		}, neverCalled(a)).end();
	},
	"Then callback run in next tick": function (t, a, d) {
		var defer = t(), x = {}, invoked = false;
		defer.resolve(x);
		defer.promise.then(function (result) {
			invoked = true;
			d();
		}, neverCalled(a)).end();
		a.equal(invoked, false);
	},
	"Call all then callbacks in order": function (t, a, d) {
		var defer = t(), x = {}, count = 0;
		defer.promise.then(function (result) {
			++count;
		}, neverCalled(a)).end();
		defer.promise.then(function (result) {
			a.equal(count, 1); d();
		}, neverCalled(a)).end();
		defer.resolve(x);
	},
	"Resolve promise with other promise": function (t, a, d) {
		var defer = t(), x = {}, d2 = t();
		defer.promise.then(function (result) {
			a.equal(result, x); d();
		}, neverCalled(a)).end();
		defer.resolve(d2.promise);
		d2.resolve(x);
	},
	"Reject": function (t, a, d) {
		var defer = t(), x = new Error('Test error'), count = 0;
		defer.resolve(x);
		defer.promise.then(neverCalled(a), function (e) {
			a.equal(x, e); d();
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
		defer.promise.then(function () {
			throw x;
		}).then(neverCalled(a), function (e) {
			a.equal(e, x); d();
		}).end();
	},
	"Error handler in end": function (t, a, d) {
		var defer = t(), x = new Error('Test error');
		defer.resolve(1);
		defer.promise.then(function () {
			throw x;
		}).end(function (e) {
			a.equal(e, x); d();
		});
	},
	"Prevent double then callbacks with alien promise": function (t, a, d) {
		var defer = t(), count = 0;
		defer.promise.then(function () {
			++count;
		});
		defer.resolve({ then: function (callback) {
			callback(); callback();
			a.equal(count, 1); d();
		}, end: noop});
		defer.promise.end();
	}
};
