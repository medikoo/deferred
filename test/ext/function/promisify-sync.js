'use strict';

var promise = require('../../../lib/promise');

module.exports = function (t) {
	var u = {}, x = {}, y = {}, z = {};

	return {
		"Success": function (a, d) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}).call(u, x, y)(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Promise arguments": function (a, d) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}).call(u, promise(x), y)(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Promise argument": function (a, d) {
			t.call(function (arg1) {
				a(this, u, "Context");
				a(arg1, x, "Arguments");
				return z;
			}).call(u, promise(x))(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Length": function (a, d) {
			t.call(function (arg1, arg2, arg3) {
				a(this, u, "Context");
				a.deep([arg1, arg2, arg3], [x, y, undefined], "Arguments");
				return z;
			}, 2).call(u, x, y, {}, {}, {})(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Error": function (a, d) {
			var e = new Error("Error");
			t.call(function () {
				throw e;
			})()(a.never, function (result) {
				a(result, e);
			}).end(d);
		}
	};
};
