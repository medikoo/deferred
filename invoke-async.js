// Invoke asynchronous function

'use strict';

var isCallable = require('es5-ext/lib/Object/is-callable')
  , callable   = require('es5-ext/lib/Object/valid-callable')
  , value      = require('es5-ext/lib/Object/valid-value')
  , callAsync  = require('./ext/function/call-async')._base

  , slice = Array.prototype.slice;

module.exports = function (obj, fn/*, …args*/) {
	value(obj);
	if (!isCallable(fn)) fn = callable(obj[fn]);
	return callAsync(fn, null, obj, slice.call(arguments, 2));
};
