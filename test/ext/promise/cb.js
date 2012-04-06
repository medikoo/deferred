'use strict';

module.exports = function (t, a) {
	var x = {}, d = t(), p = d.promise, invoked = false;

	a(p.cb(), p, "Callback is optional");
	a(p.cb(function (err, o) {
		a.deep([err, o], [null, x], "Unresolved: arguments");
		invoked = true;
	}), p, "Returns self promise");
	a(invoked, false, "Callback not invoked on unresolved promise");
	d.resolve(x);
	a(invoked, true, "Callback invoked immediately on resolution");

	invoked = false;
	p.cb(function (err, o) {
		a.deep([err, o], [null, x], "Resolved: arguments");
		invoked = true;
	});
	a(invoked, true, "Callback invoked immediately on resolved promise");

	a(p.cb(), p, "No harm when callback is not provided");

	p = t(x = new Error("Error"));
	invoked = false;
	p.cb(function (err, o) {
		a.deep([err, o], [x, undefined], "Erronous: arguments");
		invoked = true;
	});
	a(invoked, true, "Called on erronous");
};
