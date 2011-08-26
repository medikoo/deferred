// Wraps any value with promise.

'use strict';

var curry       = require('es5-ext/lib/Function/curry').call
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , merge       = require('es5-ext/lib/Object/plain/merge').call
  , nextTick    = require('clock/lib/next-tick')

  , isPromise   = require('./is-promise')

  , deferred, throwError, port;

throwError = function () {
	throw this;
};

port = {
	then: (function (callback) {
		return function (win, fail) {
			var d = deferred();
			nextTick(callback.bind(d, this.failed ? fail : win, this.value));
			return d.promise;
		};
	}(function (callback, value) {
		if (this.done) {
			return;
		}
		this.done = true;
		if (callback) {
			try {
				value = callback(value);
			} catch (e) {
				value = e;
			}
		}
		this.resolve(value);
	})),
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
