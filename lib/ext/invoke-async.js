'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , a2p        = require('../_apply_async_fn');

require('../extend')('invokeAsync', null, function (args, resolve) {
	var fn;
	if (this.failed) {
		resolve(this.promise);
		return;
	}
	fn = args[0];
	args = slice.call(args, 1);
	if (!isFunction(fn)) {
		if (!isFunction(this.value[fn])) {
			resolve(new Error("Cannot invoke '" + fn +
				"' on given result. It's not a function."));
			return;
		}
		fn = this.value[fn];
	}
	a2p(fn, this.value, args, resolve);
});

module.exports = require('../deferred');
