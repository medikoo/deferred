'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , curry      = require('es5-ext/lib/Function/prototype/curry')
  , silent     = require('es5-ext/lib/Function/prototype/silent')
  , nextTick   = require('clock/lib/next-tick')

  , deferred    = require('../deferred');

require('../_base').add('invoke', function (name) {
	var d = deferred();
	this._base._next('invoke', [arguments, d.resolve]);
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
	resolve(silent.apply(fn.bind(this._value), args));
});

module.exports = deferred;
