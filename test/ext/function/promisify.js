'use strict';

module.exports = function (t, a) {
	var u = {}, x = {}, y = {}, z = {};
	return {
		"Async": function (a, d) {
			t.call(function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}).call(u, x, y)(function (result) {
				a(result, z); d();
			}, a.never);
		},
		"Sync": function (a, d) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}).call(u, x, y)(function (result) {
				a(result, z); d();
			}, a.never);
		}
	};
};
