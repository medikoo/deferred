'use strict';

var slice      = Array.prototype.slice
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , silent     = require('es5-ext/lib/Function/prototype/silent');

require('../../extend')('invoke', null, function (args, resolve) {
	var fn;
	if (this.failed) {
		resolve(this.promise);
		return;
	}
	fn = args[0];
	args = slice.call(args, 1);
	if (!isCallable(fn)) {
		if (!isCallable(this.value[fn])) {
			resolve(new Error("Cannot invoke '" + fn +
				"' on given result. It's not a function."));
			return;
		}
		fn = this.value[fn];
	}
	resolve(silent.apply(fn.bind(this.value), args));
});

module.exports = require('../../deferred');
