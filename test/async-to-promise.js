'use strict';

module.exports = {
	"Successful": function (t, a, d) {
		var x = {};
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(null, x);
			}, 0);
		})(function (result) {
			a(result, x); d();
		}, a.never);
	},
	"Erroneous": function (t, a, d) {
		var x = new Error('Test');
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(x);
			}, 0);
		}).then(a.never, function (result) {
			a(result, x); d();
		});
	},
	"True/False": function (t, a, d) {
		t = t.call;
		t(function (callback) {
			setTimeout(function () {
				callback(false);
			}, 0);
		})(function (result) {
			a(result, false); d();
		}, a.never);
	}
};
