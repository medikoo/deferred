'use strict';

var deferred = require('../../../lib/deferred');

module.exports = function (t, a) {
	var u = {}, x = {}, y = {}, z = {};
	return {
		"Async": function (a, d) {
			var defer = deferred();
			defer.promise(function (result) {
				a(result, z);
			}, a.never).end(d);
			t.call(u, function (arg1, arg2, callback) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				setTimeout(function () {
					callback(null, z);
				}, 0);
			}, [x, y], defer.resolve);
		},
		"Sync": function (a, d) {
			var defer = deferred();
			defer.promise(function (result) {
				a(result, z);
			}, a.never).end(d);
			t.call(u, function (arg1, arg2) {
				a(this, u, "Context");
				a.deep([arg1, arg2], [x, y], "Arguments");
				return z;
			}, [x, y], defer.resolve);
		},
		"Sync error": function (a, d) {
			var defer = deferred()
			  , e = new Error("Error");
			defer.promise(a.never, function (result) {
				a(result, e);
			}).end(d);
			t(function () {
				throw e;
			}, [], defer.resolve);
		}
	};
};
