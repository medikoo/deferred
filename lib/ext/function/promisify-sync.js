// Promisify synchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , toArray        = require('es5-ext/lib/Object/prototype/to-array')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , deferred       = require('../../deferred');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	args = toArray.call(arguments);
	return function () {
		return deferred(silent.apply(fn.bind(this),
			args.concat(toArray.call(arguments))));
	};
};
