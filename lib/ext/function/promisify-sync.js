// Promisify synchronous function

'use strict';

var isArray   = Array.isArray
  , slice     = Array.prototype.slice
  , some      = Array.prototype.some
  , defineProperty = Object.defineProperty
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , silent    = require('es5-ext/lib/Function/prototype/silent')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise');

var returnsPromiseDesc = { configurable: false, enumerable: false, value: true,
	writable: false };

module.exports = function (length) {
	var fn, args;
	fn = callable(this);
	if (fn.returnsPromise) {
		return fn;
	}
	if (length != null) {
		length = length >>> 0;
	}
	return defineProperty(function () {
		var args = arguments;
		if (length != null) {
			args = slice.call(args, 0, length);
		}
		if (some.call(args, isPromise)) {
			return deferred.apply(null, args)(function (args) {
				return fn.apply(this, isArray(args) ? args : [args]);
			}.bind(this));
		} else {
			return deferred(silent.call(fn).apply(this, args));
		}
	}, 'returnsPromise', returnsPromiseDesc);
};
