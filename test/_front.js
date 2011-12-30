'use strict';

var deferred = require('../lib/deferred');

module.exports = function () {
	var x = {};
	return {
		"End": function (a, d) {
			deferred(x).end(a.never)(function (res) {
				a(res, x); d();
			});
		},
		"ValueOf": function (a, d) {
			var y = deferred();
			a(y.promise.valueOf(), y.promise, "Unresolved");
			y.resolve(x);
			a(y.promise.valueOf(), x, "Resolved");
		}
	};
};
