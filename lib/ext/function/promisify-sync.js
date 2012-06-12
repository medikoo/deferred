// Promisify synchronous function

'use strict';

var apply     = Function.prototype.apply
  , silent    = require('es5-ext/lib/Function/prototype/silent')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise');

module.exports = require('./_promisify')(function (fn, args) {
	return isPromise(args) ? args(function (args) {
		return apply.call(fn, this, args);
	}.bind(this)) : deferred(silent.call(fn).apply(this, args));
});
