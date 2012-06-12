// Promisify asynchronous function

'use strict';

var isArray        = Array.isArray
  , some           = Array.prototype.some
  , defineProperty = Object.defineProperty
  , callable       = require('es5-ext/lib/Object/valid-callable')
  , apply          = require('../utils/apply-async')
  , deferred       = require('../../deferred')
  , isPromise      = require('../../is-promise');

var returnPromiseDesc = { configurable: false, enumerable: false, value: true,
	writable: false };

module.exports = function (length) {
	var fn;
	fn = callable(this);
	if (fn.returnsPromise) {
		return fn;
	}
	if (length != null) {
		length = length >>> 0;
	}
	return defineProperty(function () {
		var deferral;
		deferral = deferred();
		if (some.call(arguments, isPromise)) {
			deferred.apply(null, arguments)(function (args) {
				apply.call(this, fn, isArray(args) ? args : [args],
					deferral.resolve, length);
			}.bind(this));
		} else {
			apply.call(this, fn, arguments, deferral.resolve, length);
		}
		return deferral.promise;
	}, 'returnsPromise', returnPromiseDesc);
};
