"use strict";

var deferred = require("../../../deferred");

module.exports = {
	"Deferred": function (a) {
		var defer = deferred(), x = {}, y = { foo: x }, invoked = false;
		defer.resolve(y).get("foo").done(function (r) {
			invoked = true;
			a(r, x);
		});
		a(invoked, true, "Resolved in current tick");
	},
	"Promise": function (a) {
		var x = {}, y = { foo: x };
		deferred(y).get("foo").done(function (r) { a(r, x); });
	},
	"Nested": function (a) {
		var x = {}, y = { foo: { bar: x } };
		deferred(y).get("foo", "bar").done(function (r) { a(r, x); });
	},
	"Safe for extensions": function (a) {
		a.throws(function () {
			var x = deferred();
			x.promise.get("foo").done(function () { throw new Error("Error"); });
			x.resolve({ foo: "bar" });
		});
	}
};
