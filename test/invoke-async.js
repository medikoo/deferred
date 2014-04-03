'use strict';

var deferred = require('../deferred');

module.exports = function (t) {
	var u = {}, x = {}, y = {}, z = {};
	return {
		"Promise arguments": function (a, d) {
			t(u, function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, x, deferred(y))(function (result) {
				a(result, z);
			}, a.never).done(d, d);
		},
		"Normal arguments": function (a, d) {
			t(u, function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, undefined], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, x, undefined)(function (result) {
				a(result, z);
			}, a.never).done(d, d);
		},
		"Successful": function (a, d) {
			var x = {}, y = {}, z = {};
			t({}, function (arg1, arg2, callback) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, x, y)(function (result) {
				a(result, z, "Result");
			}, a.never).done(d, d);
		},
		"Successful: Many args": function (a, d) {
			var x = {}, y = {}, z = {};
			t({}, function (arg1, arg2, callback) {
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, x, y, z);
				}, 0);
			}, x, y)(function (result) {
				a.deep(result, [x, y, z], "Result");
			}, a.never).done(d, d);
		},
		"Erroneous": function (a, d) {
			var x = new Error('Test');
			t({}, function (callback) {
				setTimeout(function () { callback(x); }, 0);
			})(a.never, function (e) {
				a(e, x);
			}).done(d, d);
		},
		"Function crash": function (a) {
			a.throws(t.bind({}, function () { throw x; }));
		}
	};
};
