// Wraps any value with promise.

'use strict';

var isError     = require('es5-ext/lib/Error/is-error')
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , curry       = require('es5-ext/lib/Function/curry').call
  , sequence    = require('es5-ext/lib/Function/sequence').call
  , silent      = require('es5-ext/lib/Function/silent').bind
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , nextTick    = require('clock/lib/next-tick')

  , isPromise   = require('./is-promise')

  , deferred, then, port;

then = function (win, fail) {
	var d = deferred(), cb = this.failed ? fail : win;
	nextTick(isFunction(cb) ? sequence(silent(cb, this.value), d.resolve) :
		curry(d.resolve, cb || this.value));
	return d.promise;
};

module.exports = function (value) {
	var o, p;
	if (isPromise(value)) {
		return value;
	}

	(p = then.bind(o = {})).then = p;
	bindMethods(p, o, port);

	o.then = p;
	o.value = value;
	o.failed = isError(value);

	return p;
};

port = require('./port').get().promise;
deferred = require('./deferred');
