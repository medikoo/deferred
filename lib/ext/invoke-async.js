'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , a2p        = require('../_apply_async_fn')

	, deferred    = require('../deferred');

require('../_base').add('invokeAsync', function (name) {
	var d = deferred();
	this._base._next('invokeAsync', [arguments, d.resolve]);
	return d.promise;
}, function (args, resolve) {
	var fn;
	if (this._failed) {
		resolve(this._promise);
		return;
	}
	fn = args[0];
	args = slice.call(args, 1);
	if (!isFunction(fn)) {
		if (!isFunction(this._value[fn])) {
			resolve(new Error("Cannot invoke '" + fn +
				"' on given result. It's not a function."));
			return;
		}
		fn = this._value[fn];
	}
	a2p(fn, this._value, args, resolve);
});

module.exports = deferred;
