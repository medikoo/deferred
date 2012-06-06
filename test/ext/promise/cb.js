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

	p = t(x = new Error("Error"));
	invoked = false;
	p.cb(function (err, o) {
		a.deep([err, o], [x, undefined], "Erronous: arguments");
		invoked = true;
	});
	a(invoked, true, "Called on erronous");

	invoked = false;
	p.cb(a.never, function (err) {
		a(err , x, "Two arguments: error");
		invoked = true;
	});
	a(invoked, true, "Two arguments: Called on erronous");

	p.cb(a.never, null);

	invoked = false;
	p = t(x = {});
	p.cb(function (arg) {
		a(arg, x, "Two arguments: success");
		invoked = true;
	}, a.never);
	a(invoked, true, "Two arguments: Called on success");

	p.cb(null, a.never);
};
