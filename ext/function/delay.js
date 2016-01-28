// Delay function execution, return promise for delayed function result

'use strict';

var callable      = require('es5-ext/object/valid-callable')
  , nextTick      = require('next-tick')
  , ensureTimeout = require('timers-ext/valid-timeout')
  , deferred      = require('../../deferred')

  , apply    = Function.prototype.apply
  , delayed;

delayed = function (fn, args, resolve, reject) {
	var value;
	try {
		value = apply.call(fn, this, args);
	} catch (e) {
		reject(e);
		return;
	}
	resolve(value);
};

module.exports = function (timeout) {
	var fn, result, delay;
	fn = callable(this);
	if (timeout == null) {
		delay = nextTick;
	} else {
		timeout = ensureTimeout(timeout);
		delay = setTimeout;
	}
	result = function () {
		var def = deferred();
		delay(delayed.bind(this, fn, arguments, def.resolve, def.reject), timeout);
		return def.promise;
	};
	result.returnsPromise = true;
	return result;
};
