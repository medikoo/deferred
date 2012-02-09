// Promisify synchronous function

'use strict';

var isArray        = Array.isArray
  , slice          = Array.prototype.slice
  , some           = Array.prototype.some
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , deferred       = require('../../deferred')
  , isPromise      = require('../../is-promise');

module.exports = function (length) {
	var fn, args;
	assertCallable(this);
	fn = this;
	if (length != null) {
		length = length >>> 0;
	}
	return function () {
		var args = arguments;
		if (length != null) {
			args = slice.call(args, 0, length);
		}
		if (some.call(args, isPromise)) {
			return deferred.apply(null, args)(function (args) {
				return fn.apply(this, isArray(args) ? args : [args]);
			}.bind(this));
		} else {
			return deferred(silent.apply(fn.bind(this), args));
		}
	};
};
