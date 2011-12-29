'use strict';

module.exports = function (t, a) {
	var x = {}, y = {}, z = {};
	a(t, require('../lib/deferred'));

	return {
		"afn": function (a, d) {
			t.afn(function (arg1, arg2, callback) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, x, y)(function (result) {
				a(result, z); d();
			}, a.never);
		},
		"bafn": function (a, d) {
			t.bafn(function (arg1, arg2, callback) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, x)(y)(function (result) {
				a(result, z); d();
			}, a.never);
		}
	};
};
