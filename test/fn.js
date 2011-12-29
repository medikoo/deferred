'use strict';

module.exports = function (t, a) {
	var x = {}, y = {}, z = {};
	a(t, require('../lib/deferred'));

	return {
		"fn": function (a, d) {
			t.fn(function (arg1, arg2) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}, x, y)(function (result) {
				a(result, z); d();
			}, a.never);
		},
		"bfn": function (a, d) {
			t.bfn(function (arg1, arg2) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}, x)(y)(function (result) {
				a(result, z); d();
			}, a.never);
		},
		"Error": function (a, d) {
			var e = new Error("Error");
			t.fn(function () {
				throw e;
			})(a.never, function (result) {
				a(result, e); d();
			});
		}
	};
};
