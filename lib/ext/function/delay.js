// Delay function execution, return promise for delayed function result

'use strict';

var silent   = require('es5-ext/lib/Function/prototype/silent')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , deferred = require('../../deferred')

  , delayed;

delayed = function (fn, args, resolve) {
	resolve(silent.call(fn).apply(this, args));
};

module.exports = function (timeout) {
	var fn = callable(this);
	return function () {
		var d = deferred();
		setTimeout(delayed.bind(this, fn, arguments, d.resolve), timeout);
		return d.promise;
	};
};
