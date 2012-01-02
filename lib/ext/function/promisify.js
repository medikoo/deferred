// Promisify function.
// It's universal approach that should work for both synchronous and
// asynchronous functions. It may not produce desired result for specific cases
// (e.g. synchrouns function that takes variable ammount of arguments), choose
// then directly promisifySync or promisifyAsync methods.

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
		var d, r;
		d = deferred();
		try {
			r  = apply(fn, this, args.concat(toArray.call(arguments)), d.resolve);
		} catch (e) {
			r = e;
		}
		if (r !== undefined) {
			d.resolve(r);
		}
		return d.promise;
	};
};
