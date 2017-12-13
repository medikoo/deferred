// Delay function execution, return promise for delayed function result

"use strict";

var isValue       = require("es5-ext/object/is-value")
  , callable      = require("es5-ext/object/valid-callable")
  , nextTick      = require("next-tick")
  , ensureTimeout = require("timers-ext/valid-timeout")
  , deferred      = require("../../deferred");

var apply = Function.prototype.apply, delayed;

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
	if (isValue(timeout)) {
		timeout = ensureTimeout(timeout);
		delay = setTimeout;
	} else {
		delay = nextTick;
	}
	result = function () {
		var def = deferred();
		delay(delayed.bind(this, fn, arguments, def.resolve, def.reject), timeout);
		return def.promise;
	};
	result.returnsPromise = true;
	return result;
};
