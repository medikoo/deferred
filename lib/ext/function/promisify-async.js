// Promisify asynchronous function

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , apply          = require('../utils/apply-async')
  , deferred       = require('../../deferred');

module.exports = function () {
	var fn, args;
	assertCallable(this);
	fn = this;
	return function () {
		var d;
		d = deferred();
		apply.call(this, fn, arguments, d.resolve);
		return d.promise;
	};
};
