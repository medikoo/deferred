"use strict";

var deferred = require("../../../deferred");

module.exports = function (t) {
	var u = {}, x = {}, y = {}, z = {};

	return {
		"Promise arguments": function (a) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}, 2)
				.call(u, x, deferred(y), z)
				.done(function (result) { a(result, z); });
		},
		"Normal arguments": function (a) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, undefined], "Arguments");
				return z;
			}, 2)
				.call(u, x)
				.done(function (result) { a(result, z); });
		},
		"Error": function (a) {
			var e = new Error("Error");
			t.call(function () { throw e; })().done(a.never, function (result) { a(result, e); });
		}
	};
};
