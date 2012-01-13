'use strict';

var isArray    = Array.isArray
  , slice      = Array.prototype.slice
  , some       = Array.prototype.some
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , deferred   = require('../../../deferred')
  , isPromise  = require('../../../is-promise');

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
	if (some.call(args, isPromise)) {
		deferred.apply(null, args)
		(function (args) {
			apply.call(base.value, fn, isArray(args) ? args : [args], resolve);
		});
	} else {
		apply.call(base.value, fn, args, resolve);
	}

	apply.call(base.value, fn, args, resolve);
};
