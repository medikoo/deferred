// Promisify synchronous function

'use strict';

var isArray        = Array.isArray
  , some           = Array.prototype.some
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , deferred       = require('../../deferred')
  , isPromise      = require('../../is-promise');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	return function () {
		if (some.call(arguments, isPromise)) {
			return deferred.apply(null, arguments)
			(function (args) {
				return fn.apply(this, isArray(args) ? args : [args]);
			}.bind(this));
		} else {
			return deferred(silent.apply(fn.bind(this), arguments));
		}
	};
};
