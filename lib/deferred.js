// Returns function that returns deferred or promise object.
//
// 1. If invoked without arguments then deferred object is returned
//    Deferred object consist of promise (unresolved) function and resolve
//    function through which we resolve promise
// 2. If invoked with one argument then promise is returned which resolved value
//    is given argument. Argument may be any value (even undefined),
//    if it's promise then same promise is returned
// 3. If invoked with more than one arguments then promise that resolves with
//    array of all resolved arguments is returned.

'use strict';

var every     = Array.prototype.every
  , push      = Array.prototype.push
  , isError   = require('es5-ext/lib/Error/is-error')
  , isPromise = require('./is-promise')

  , promise, Deferred;

Deferred = function () {
	this.promise = promise();
	this.resolve = this.resolve.bind(this);
};

Deferred.prototype = {
	resolved: false,
	resolve: function (value) {
		var i, name, args, data
		if (this.resolved) {
			return this.promise;
		}
		this.resolved = true;
		if (!--promise.unresolvedCount) {
			clearTimeout(promise.unresolvedTimeout);
		}
		if (this.promise.monitor) {
			clearTimeout(this.promise.monitor);
		}
		if (isPromise(value)) {
			if (!value.resolved) {
				if (!value.dependencies) {
					value.dependencies = [];
				}
				value.dependencies.push(this.promise);
				if (this.promise.pending) {
					if (value.pending) {
						push.apply(value.pending, this.promise.pending);
						this.promise.pending = value.pending;
					} else {
						value.pending = this.promise.pending;
					}
				} else if (value.pending) {
					this.promise.pending = value.pending;
				} else {
					this.promise.pending = value.pending = [];
				}
				return this.promise;
			} else {
				value = value.value;
			}
		}
		this.promise.value = value;
		this.promise.failed = (value && isError(value)) || false;
		this.promise.__proto__ = promise.resolved;
		if (this.promise.dependencies) {
			this.promise.dependencies.forEach(function self(dPromise) {
				dPromise.value = value;
				dPromise.failed = this.failed;
				dPromise.__proto__ = promise.resolved;
				delete dPromise.pending;
				if (dPromise.dependencies) {
					dPromise.dependencies.forEach(self, this);
					delete dPromise.dependencies;
				}
			}, this.promise);
			delete this.promise.dependencies;
		}
		if ((data = this.promise.pending)) {
			for (i = 0; name = data[i], args = data[++i]; ++i) {
				promise.onswitch[name].apply(this.promise, args);
			}
			delete this.promise.pending;
		}
		return this.promise;
	}
};

module.exports = function (value) {
	var o, l, args, d, waiting, initialized, result
	if ((l = arguments.length)) {
		if (l > 1) {
			d = new Deferred();
			waiting = 0;
			result = new Array(arguments.length);
			every.call(arguments, function (value, index) {
				if (isPromise(value)) {
					++waiting;
					value.end(function (value) {
						result[index] = value;
						if (!--waiting && initialized) {
							d.resolve(result);
						}
					}, d.resolve);
				} else if (isError(value)) {
					d.resolve(value);
					return false;
				} else {
					result[index] = value;
				}
				return true;
			});
			initialized = true;
			if (!waiting) {
				d.resolve(result);
			}
			return d.promise;
		} else {
			return promise(value);
		}
	}

	return new Deferred();
};


promise = require('./promise');
