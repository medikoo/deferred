'use strict';

var slice      = Array.prototype.slice
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , apply      = require('../utils/apply-async');

require('../../extend')('invokeAsync', null, function (args, resolve) {
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
				"' on given value. It's not a function."));
			return;
		}
		fn = this.value[fn];
	}
	apply.call(this.value, fn, args, resolve);
});

module.exports = require('../../deferred');
