// Default ports for deferred

'use strict';

var curry      = require('es5-ext/lib/Function/curry').call
  , isFunction = require('es5-ext/lib/Function/is-function')
  , throwError = require('es5-ext/lib/Error/throw')
  , nextTick   = require('clock/lib/next-tick')

  , deferred, ports, deferredDefault;

deferredDefault = function (name) {
	return function () {
		var d = deferred();
		this.queue([name, arguments, d.resolve]);
		return d.promise;
	};
};

ports = {
	deferred: {
		end: function (handler) {
			this.queue(['end', [handler]]);
			return this.promise;
		}
	},
	promise: {
		end: function (handler) {
			if (this.failed) {
				nextTick(
					isFunction(handler) ? curry(handler, this.value) :
						throwError.bind(this.value));
			}
			return this.then;
		}
	}
};

exports.get = function () {
	return ports;
};

exports.add = function (name, forPromise, forDeferred) {
	ports.promise[name] = forPromise;
	ports.deferred[name] = forDeferred || deferredDefault(name);
};

deferred = require('./deferred');