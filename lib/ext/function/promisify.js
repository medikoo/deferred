// Promisify function.
// It's universal approach that should work for both synchronous and
// asynchronous functions. It may not produce desired result for specific cases
// (e.g. synchrouns function that takes variable ammount of arguments). In such
// cases use direct promisifyAsync and promisifySync methods accordingly

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , apply          = require('../apply_async_fn')
  , deferred       = require('../../deferred');

module.exports = function () {
	var d, r;
	assertCallable(this);
	d = deferred();
	try {
		r  = apply(this, null, arguments, d.resolve);
	} catch (e) {
		r = e;
	}
	if (r !== undefined) {
		d.resolve(r);
	}
	return d.promise;
};
