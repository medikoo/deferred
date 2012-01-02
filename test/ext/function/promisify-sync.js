'use strict';

module.exports = function (t, a) {
	var u = {}, x = {}, y = {}, z = {};

	return {
		"Success": function (a, d) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}, x).call(u, y)(function (result) {
				a(result, z); d();
			}, a.never);
		},
		"Error": function (a, d) {
			var e = new Error("Error");
			t.call(function () {
				throw e;
			})()(a.never, function (result) {
				a(result, e); d();
			});
		}
	};
};
