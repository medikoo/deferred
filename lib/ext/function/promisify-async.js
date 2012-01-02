// Promisify asynchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , apply          = require('../apply_async_fn')
  , deferred       = require('../../deferred');

module.exports = function () {
	var d;
	assertCallable(this);
	d = deferred();
	apply(this, null, arguments, d.resolve);
	return d.promise;
};
