"use strict";

var aFrom    = require("es5-ext/array/from")
  , deferred = require("../../../deferred");

module.exports = function (t) {
	var fn, gfn, x = {}, y = {}, z = {}, args, dx, dy, dz, hz, resolved, released;

	fn = function (p) {
		args = aFrom(arguments);
		return p;
	};
	return {
		"Limit": function (a) {
			var invoked, x = {};
			gfn = t.call(fn, 2);
			dx = deferred();
			a(gfn(dx.promise, "x"), dx.promise, "#1"); // X
			dy = deferred();
			a(gfn(dy.promise, "y"), dy.promise, "#2"); // Y
			dz = deferred();
			a.not((hz = gfn(dz.promise, "z")), dz.promise, "#3 blocked");
			hz.on("test", function (arg) { invoked = arg; });
			hz.done(function (r) {
				released = true;
				a(r, z, "Held resolution");
				a(resolved, true, "Held timing");
			});
			gfn(x, y, z);
			dz.resolve(z);
			resolved = true;
			dy.resolve(y); // Z, 4
			dz.promise.emit("test", x);
			a(invoked, x, "Events unified");
			a(released, true, "Released");
			resolved = false;
			dx.resolve(x);
			a.deep(args, [x, y, z], "Held Arguments");
		},
		"No args": function (a) {
			gfn = t.call(fn);
			dx = deferred();
			a(gfn(dx.promise), dx.promise, "#1");
			dz = deferred();
			a.not((hz = gfn(dz.promise)), dz.promise, "#2 blocked");
			hz.done(function (r) {
				a(r, z, "Held resolution");
				a(resolved, true, "Held timing");
			});
			dz.resolve(z);
			resolved = true;
			dx.resolve(x);
			resolved = false;
		},
		"Queue limit 0": function (a) {
			gfn = t.call(fn, 2, 0);
			dx = deferred();
			a(gfn(dx.promise), dx.promise, "#1");
			dy = deferred();
			a(gfn(dy.promise), dy.promise, "#2");
			gfn(x).done(null, function (err) {
				a(err.type, "deferred-gate-rejected", "Reject error");
			});
			dy.resolve(y);
			dz = deferred();
			a(gfn(dz.promise), dz.promise, "#3");
			gfn(x).done(null, function (err) {
				a(err.type, "deferred-gate-rejected", "Reject error");
			});
			dx.resolve(x);
			dz.resolve(z);
		},
		"Queue limit 2": function (a) {
			gfn = t.call(fn, 2, 1);
			// X
			dx = deferred();
			a(gfn(dx.promise), dx.promise, "#1");
			// X, y
			dy = deferred();
			a(gfn(dy.promise), dy.promise, "#2");
			// X, y, z
			dz = deferred();
			a.not((hz = gfn(dz.promise)), dz.promise, "#3 blocked");
			hz.done(function (r) { a(r, z, "#3 held"); });
			// X, y, z
			gfn(x).done(null, function (err) {
				a(err.type, "deferred-gate-rejected", "Reject error");
			});
			dz.resolve(z);
			dy.resolve(y);

			// X
			// x, y
			dy = deferred();
			a(gfn(dy.promise), dy.promise, "#2");
			// X, y, z
			dz = deferred();
			a.not((hz = gfn(dz.promise)), dz.promise, "#3 blocked");
			hz.done(function (r) { a(r, z, "#3 held"); });
			// X, y, z
			gfn(x).done(null, function (err) {
				a(err.type, "deferred-gate-rejected", "Reject error");
			});
			dz.resolve(z);
			dy.resolve(y);
			dx.resolve(x);
		},
		"Resolution type": function (a) {
			var error = new Error("Test");
			gfn = t.call(function () { return deferred.reject(error); }, 1, 0);
			gfn().done(a.never, function (err) { a(err, error); });
		}
	};
};
