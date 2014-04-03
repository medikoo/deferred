// Delay function execution, return promise for delayed function result

'use strict';

var apply    = Function.prototype.apply
  , callable = require('es5-ext/object/valid-callable')
  , deferred = require('../../deferred')

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
	var fn, result;
	fn = callable(this);
	result = function () {
		var def = deferred();
		setTimeout(delayed.bind(this, fn, arguments, def.resolve, def.reject),
			timeout);
		return def.promise;
	};
	result.returnsPromise = true;
	return result;
};
