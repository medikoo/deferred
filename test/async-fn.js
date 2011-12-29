'use strict';

module.exports = {
	"Successful": function (t, a, d) {
		var x = {};
		t = require('../lib').afn
		t(function (callback) {
			setTimeout(function () {
				callback(null, x);
			}, 0);
		})(function (result) {
			a(result, x); d();
		}, a.never);
	},
	"Successful: Many args": function (t, a, d) {
		var x = {}, y = {}, z = {};
		t = require('../lib').afn
		t(function (callback) {
			setTimeout(function () {
				callback(null, x, y, z);
			}, 0);
		})(function (result) {
			a.deep(result, [x, y, z]); d();
		}, a.never);
	},
	"Erroneous": function (t, a, d) {
		var x = new Error('Test');
		t = require('../lib').afn
		t(function (callback) {
			setTimeout(function () {
				callback(x);
			}, 0);
		}).then(a.never, function (result) {
			a(result, x); d();
		});
	},
	"True/False": function (t, a, d) {
		t = require('../lib').afn
		t(function (callback) {
			setTimeout(function () {
				callback(false);
			}, 0);
		})(function (result) {
			a(result, false); d();
		}, a.never);
	}
};
