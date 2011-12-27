// Delay function execution, return promise for function result

'use strict';

var silent   = require('es5-ext/lib/Function/prototype/silent')

  , deferred = require('./deferred');

module.exports = function (timeout) {
	return function () {
		var fn = this, args = arguments;
		var d = deferred();
		setTimeout(function () {
			d.resolve(silent.call(fn, args));
		}, timeout);
		return d.promise;
	};
};
