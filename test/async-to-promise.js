'use strict';

var neverCalled = require('tad/lib/utils/never-called');

module.exports = {
	"Successful": function (t, a, d) {
		var x = {};
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(null, x);
			}, 0);
		}).then(function (result) {
			a.equal(result, x); d();
		}, neverCalled(a));
	},
	"Erroneous": function (t, a, d) {
		var x = new Error('Test');
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(x);
			}, 0);
		}).then(neverCalled(a), function (result) {
			a.equal(result, x); d();
		});
	},
	"True/False": function (t, a, d) {
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(false);
			}, 0);
		}).then(function (result) {
			a.equal(result, false); d();
		}, neverCalled(a));
	}
};
