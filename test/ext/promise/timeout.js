"use strict";

var Deferred = require("../../../deferred");

module.exports = function (t, a, d) {
	var x = {}, deferred = new Deferred(), promise = deferred.promise.timeout(10);
	deferred.resolve(x);
	setTimeout(function () {
		a(promise.value, x);
		deferred = new Deferred();
		promise = deferred.promise.timeout(10);
		setTimeout(function () {
			deferred.resolve();
			a(promise.failed, true);
			a(promise.value.code, "DEFERRED_TIMEOUT");
			d();
		}, 20);
	}, 20);
};
