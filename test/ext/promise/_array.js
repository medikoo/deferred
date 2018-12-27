"use strict";

var isError  = require("es5-ext/error/is-error")
  , deferred = require("../../../deferred");

module.exports = function (t) {
	t("map", require("../../../ext/array/map"));

	return {
		Direct: function (a) {
			deferred([deferred(1), deferred(2), 3])
				.map(function (res) { return deferred(res * res); })(function (r) {
					a.deep(r, [1, 4, 9]);
				}, a.never)
				.done();
		},
		Delayed: function (a) {
			var def = deferred();
			def.promise
				.map(function (res) { return deferred(res * res); })(function (r) {
					a.deep(r, [1, 4, 9]);
				}, a.never)
				.done();
			def.resolve([deferred(1), deferred(2), 3]);
		},
		OnSettledRejected: function (a) {
			var error = new Error("foo");
			deferred
				.reject(error)
				.map(function () { return "foo"; })
				.done(a.never, function (reason) { a(reason, error); });
		},
		OnPendingRejected: function (a) {
			var error = new Error("foo");
			var def = deferred();
			def.promise
				.map(function () { return "foo"; })
				.done(a.never, function (reason) { a(reason, error); });
			def.reject(error);
		},
		Error: function (a) {
			t("reduce", require("../../../ext/array/reduce"));
			deferred([])
				.reduce(function () { return null; })(a.never, function (err) {
					a(isError(err), true, "Error");
				})
				.done();
		}
	};
};
