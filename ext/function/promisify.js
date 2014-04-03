// Promisify asynchronous function

'use strict';

var callable  = require('es5-ext/object/valid-callable')
  , callAsync = require('./call-async')._base;

module.exports = function (length) {
	var fn, result;
	fn = callable(this);
	if (fn.returnsPromise) return fn;
	if (length != null) length = length >>> 0;
	result = function () { return callAsync(fn, length, this, arguments); };
	result.returnsPromise = true;
	return result;
};
