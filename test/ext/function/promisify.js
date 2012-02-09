'use strict';

var promise = require('../../../lib/promise');

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
				a(result, z);
			}, a.never).end(d);
		},
		"Sync": function (a, d) {
			t.call(function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}).call(u, x, y)(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Promise arguments": function (a, d) {
			t.call(function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}).call(u, promise(x), y)(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Promise argument": function (a, d) {
			t.call(function (arg1, callback) {
				a(this, u, "Context");
				a(arg1, x, "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}).call(u, promise(x))(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Length": function (a, d) {
			t.call(function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, 2).call(u, x, y, {}, {}, {})(function (result) {
				a(result, z);
			}, a.never).end(d);
		}
	};
};
