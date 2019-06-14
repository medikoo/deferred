"use strict";

var deferred  = require("../../../deferred")
  , isPromise = require("../../../is-promise");

module.exports = function (t, a) {
	var x = {}, y, z = 0, w;
	a(t.call([]).valueOf(), undefined, "Empty, no cb");
	a(t.call([], function () { return true; }).valueOf(), undefined, "Empty, cb");
	a(t.call([x]).valueOf(), x, "One, truthy, no cb");
	a(t.call([0]).valueOf(), undefined, "One, falsy, no cb");
	a(t.call([0, x]).valueOf(), x, "Two, falsy & truthy, no cb");
	a(t.call([0, false]).valueOf(), undefined, "Two, falsy & falsy, no cb");
	a(
		t
			.call(
				(y = [false]),
				function (a1, a2, a3) {
					++z;
					a(a1, false, "Argument");
					a(a2, 0, "Index");
					a(a3, y, "List");
					a(this, x, "Context");
					return true;
				},
				x
			)
			.valueOf(),
		false,
		"One, falsy, cb truthy"
	);
	a(z, 1, "Callback called");
	a(t.call([1], function () { return false; }).valueOf(), undefined, "One, truthy, cb falsy");
	a(
		t
			.call([1, 0], function (x) {
				++z;
				return !x;
			})
			.valueOf(),
		0,
		"Two, cb, Second truthy"
	);
	a(z, 3, "Callback called twice");

	y = deferred();
	w = t.call([y.promise, 3, 4]);
	a(isPromise(w.valueOf()), true, "In order");
	y.resolve(0);
	a(w.valueOf(), 3, "In order, resolved");

	y = deferred();
	z = [];
	w = t.call([y.promise, 3, 4], function (val) {
		z.push(val);
		return Boolean(val);
	});
	a(isPromise(w.valueOf()), true, "In order, cb");
	y.resolve(0);
	a(w.valueOf(), 3, "In order, cb, resolved");
	a.deep(z, [0, 3], "In order, cb, called");

	y = deferred();
	z = [];
	w = t.call([0, 3, 4], function (val) {
		z.push(val);
		return y.promise;
	});
	a(isPromise(w.valueOf()), true, "Promise cb");
	a.deep(z, [0], "Promise cb, processed one");
	y.resolve(3);
	a(w.valueOf(), 0, "Promise cb, resolved");
	a.deep(z, [0], "Promise cb, processed, resolved");
};
