'use strict';

var promise = require('../../../lib/promise');

module.exports = function (t) {
	var u = {}, x = {}, y = {}, z = {};
	return {
		"Promise arguments": function (a, d) {
			t.call(function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, 2).call(u, x, promise(y), z)(function (result) {
				a(result, z);
			}, a.never).end(d);
		},
		"Normal arguments": function (a, d) {
			t.call(function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, undefined], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, 2).call(u, x)(function (result) {
				a(result, z);
			}, a.never).end(d);
		}
	};
};
