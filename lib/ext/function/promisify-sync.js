// Promisify synchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , deferred       = require('../../deferred');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	return function () {
		return deferred(silent.apply(fn.bind(this), arguments));
	};
};
