// Promisify asynchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , toArray        = require('es5-ext/lib/Object/prototype/to-array')
  , apply          = require('../utils/apply-async')
  , deferred       = require('../../deferred');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	args = toArray.call(arguments);
	return function () {
		var d;
		d = deferred();
		apply.call(this, fn, args.concat(toArray.call(arguments)), d.resolve);
		return d.promise;
	};
};
