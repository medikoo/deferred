// Wraps any value with promise. Not very useful on its own, used internally
// by deferred.js

'use strict';

var curry       = require('es5-ext/lib/Function/curry').call
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , noop        = require('es5-ext/lib/Function/noop')
  , sequence    = require('es5-ext/lib/Function/sequence').call

  , isPromise   = require('./is-promise')

  , deferred, then, throwError, end;

then = function (value, ignore, callback) {
	var d = deferred();
	setTimeout(callback ?
		sequence(curry(callback, value), d.resolve) :
		d.resolve.bind(d, value), 0);
	return d.promise;
};

throwError = function () {
	throw this;
};

end = function (handler) {
	setTimeout(
		isFunction(handler) ? curry(handler, this) : throwError.bind(this), 0);
};

module.exports = function (value) {
	var r;
	if (isPromise(value)) {
		return value;
	} else if (value instanceof Error) {
		r = curry(then, value);
		r.end = end.bind(value);
	} else {
		r = curry(then, value, null);
		r.end = noop;
	}
	return r.then = r;
};

deferred = require('./deferred');
