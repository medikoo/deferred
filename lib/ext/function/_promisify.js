// Promisify utility

'use strict';

var isArray        = Array.isArray
  , push           = Array.prototype.push
  , slice          = Array.prototype.slice
  , some           = Array.prototype.some
  , max            = Math.max
  , defineProperty = Object.defineProperty
  , callable       = require('es5-ext/lib/Object/valid-callable')
  , deferred       = require('../../deferred')
  , isPromise      = require('../../is-promise');

var returnPromiseDesc = { configurable: false, enumerable: false, value: true,
	writable: false };

module.exports = function (apply) {
	return function (length) {
		var fn;
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
				push.apply(args, Array(max(length - args.length, 0)));
			}
			if (some.call(args, isPromise)) {
				args = deferred.apply(null, args)(function (args) {
					return isArray(args) ? args : [args];
				});
			}
			return apply.call(this, fn, args);
		}, 'returnsPromise', returnPromiseDesc);
	};
};
