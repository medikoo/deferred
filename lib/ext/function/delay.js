// Delay function execution, return promise for function result

'use strict';

var silent   = require('es5-ext/lib/Function/prototype/silent')
  , deferred = require('../../deferred')
  , delayed;

delayed = function (args, resolve) {
	resolve(silent.apply(this, args));
};

module.exports = function (timeout) {
	var fn;
	assertCallable(this);
	fn = this;
	return function () {
		var d = deferred();
		setTimeout(delayed.bind(fn.bind(this), args, d.resolve), timeout);
		return d.promise;
	};
};
