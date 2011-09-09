'use strict';

var deferred = require('../lib/deferred');

module.exports = function (t, a, d) {
	var f1, f2;
	f1= function () {
		var d = deferred();
		this._base.foo('raz', d.resolve);
		return d.promise;
	}
	f2 = function (x, resolve) { resolve(x + 'dwa'); };

	t.add('foo', f1, f2);
	deferred().resolve().foo()
	(function (r) {
		var base;
		a(r, 'razdwa');
		base = t.get();
		delete base.promise.foo;
		delete base.resolved.foo;
		delete base.unresolved.foo;
		d();
	}, d);
};
