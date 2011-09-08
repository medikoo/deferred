// Delay function execution, return promise for function result

'use strict';

var f        = require('es5-ext/lib/Function/functionalize')
  , silent   = require('es5-ext/lib/Function/silent').call

  , deferred = require('./deferred');

module.exports = function (timeout) {
	return f(function () {
		var fn = this, args = arguments;
		var d = deferred();
		setTimeout(function () {
			d.resolve(silent(fn, args));
		}, timeout);
		return d.promise;
	});
};
