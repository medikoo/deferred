// Promisify asynchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , toArray        = require('es5-ext/lib/Object/prototype/to-array')
  , apply          = require('../apply_async_fn')
  , deferred       = require('../../deferred');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	args = toArray.call(arguments);
	return function () {
		var d;
		d = deferred();
		apply(fn, this, args.concat(toArray.call(arguments)), d.resolve);
		return d.promise;
	};
};
