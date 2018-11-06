"use strict";

var deferred = require("../deferred");

var reject = deferred.reject;

module.exports = function (T) {
	var x = {}, y = {}, z = {}, e = new Error("Error");

	return {
		"Empty": function (a, d) {
			new T([]).promise(function (result) { a.deep(result, undefined); }, a.never).done(d, d);
		},
		"One": {
			Value: function (a, d) {
				new T([x])
					.promise(function (result) { a.deep(result, undefined); }, a.never)
					.done(d, d);
			},
			Promise: function (a, d) {
				new T([deferred(x)])
					.promise(function (result) { a.deep(result, undefined); }, a.never)
					.done(d, d);
			}
		},
		"Many": {
			"Error": function (a, d) {
				new T([x, y, deferred(x), reject(e), z]).promise(a.never, function (res) {
					a(res, e);
					d();
				});
			},
			"Values & Promises": function (a, d) {
				new T([x, y, deferred(x), z, deferred(y)])
					.promise(function (res) { a.deep(res, undefined); }, a.never)
					.done(d, d);
			},
			"Postponed": function (a, d) {
				var def = deferred(), resolved = false;
				new T([x, y, deferred(x), def.promise, z, deferred(y)])
					.promise(function (res) { a.deep(res, undefined); }, a.never)
					.done(d, d);
				a(resolved, false);
				def.resolve();
			},
			"Error promise": function (a, d) {
				new T([x, y, deferred(e), z, deferred(y)])
					.promise(a.never, function (res) { a(res, e); }, a.never)
					.done(d, d);
			}
		},
		"Resolve not via then": function (a) {
			// With v0.3.0 we introduced a bug - resolve of map in some cases was
			// called within callback passed to then, therefore any following errors
			// in given event loop were silent - this test makes sure it's not the
			// case anymore

			var d = deferred();
			new T([d.promise]).promise.done(function () { throw new Error("ERROR"); });
			a.throws(d.resolve);
		}
	};
};
