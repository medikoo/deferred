'use strict';

var slice      = Array.prototype.slice
  , isCallable = require('es5-ext/lib/Object/is-callable')

module.exports = function (base, fn, args, apply, resolve) {
	if (base.failed) {
		resolve(base.promise);
		return;
	}
	if (!isCallable(fn)) {
		if (!isCallable(base.value[fn])) {
			resolve(new Error("Cannot invoke '" + fn +
				"' on given value. It's not a function."));
			return;
		}
		fn = base.value[fn];
	}
	apply.call(base.value, fn, args, resolve);
};
