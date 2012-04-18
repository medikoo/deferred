// Promisify asynchronous function

'use strict';

var isArray        = Array.isArray
  , some           = Array.prototype.some
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , apply          = require('../utils/apply-async')
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
		var d;
		d = deferred();
		if (some.call(arguments, isPromise)) {
			deferred.apply(null, arguments)(function (args) {
				apply.call(this, fn, isArray(args) ? args : [args], d.resolve, length);
			}.bind(this));
		} else {
			apply.call(this, fn, arguments, d.resolve, length);
		}
		return d.promise;
	};
};
