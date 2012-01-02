'use strict';

module.exports = function (t) {
	var x = {};
	return {
		"Async": function (a, d) {
			t(function (cb) {
				cb(null, x);
			})(function (r) {
				a(r, x); d();
			}, a.never);
		},
		"Sync": function (a, d) {
			t(function () {
				return x;
			})(function (r) {
				a(r, x); d();
			}, a.never);
		}
	}
};
