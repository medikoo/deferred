// Wraps any value with promise.

'use strict';

var curry       = require('es5-ext/lib/Function/curry').call
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , sequence    = require('es5-ext/lib/Function/sequence').call
  , silent      = require('es5-ext/lib/Function/silent').bind
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , merge       = require('es5-ext/lib/Object/plain/merge').call
  , throwError  = require('es5-ext/lib/Error/throw')
  , nextTick    = require('clock/lib/next-tick')

  , isPromise   = require('./is-promise')

  , deferred, port;

port = {
	then: function (win, fail) {
		var d = deferred(), cb = this.failed ? fail : win;
		nextTick(cb ? sequence(silent(cb, this.value), d.resolve) :
			curry(d.resolve, this.value));
		return d.promise;
	},
	cb: function (cb) {
		nextTick(this.failed ?
			curry(cb, this.value, null) :
			curry(cb, null, this.value));
	},
	end: function (handler) {
		if (this.failed) {
			nextTick(
				isFunction(handler) ? curry(handler, this.value) :
					throwError.bind(this.value));
		}
		return this.then;
	}
};

module.exports = function (value) {
	var p, r;
	if (isPromise(value)) {
		return value;
	}
	p = bindMethods({}, null, port);
	r = merge(p.then, p);
	p.value = value;
	p.failed = value instanceof Error;
	return r;
};

deferred = require('./deferred');
