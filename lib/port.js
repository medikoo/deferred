// Default ports for deferred

'use strict';

var curry      = require('es5-ext/lib/Function/curry').call
  , isFunction = require('es5-ext/lib/Function/is-function')
  , throwError = require('es5-ext/lib/Error/throw')
  , nextTick   = require('clock/lib/next-tick')

  , deferred, ports, deferredDefault;

deferredDefault = function (name) {
	return function () {
		if (this.pending) {
			var d = deferred();
			this.pending.push([name, arguments, d.resolve]);
			return d.promise;
		} else {
			return this.value[name].apply(this.value, arguments);
		}
	};
};

ports = {
	deferred: {
		end: function (handler) {
			if (this.pending) {
				this.pending.push(['end', [handler]]);
				return this.promise;
			} else {
				return this.value.end(handler);
			}
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