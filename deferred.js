/* eslint max-statements: "off", max-depth: "off" */

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

"use strict";

var isError        = require("es5-ext/error/is-error")
  , noop           = require("es5-ext/function/noop")
  , setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , isPromise      = require("./is-promise");

var every = Array.prototype.every
  , push = Array.prototype.push
  , getPrototypeOf = Object.getPrototypeOf
  , Deferred
  , createDeferred
  , count = 0
  , timeout
  , extendShim
  , ext
  , resolve
  , assimilate;

extendShim = function (promise) {
	ext._names.forEach(function (name) {
		promise[name] = function () {
			return getPrototypeOf(promise)[name].apply(promise, arguments);
		};
	});
	promise.returnsPromise = true;
	promise.resolved = getPrototypeOf(promise).resolved;
};

resolve = function (value, failed) {
	var promise = function (win, fail) { return promise.then(win, fail); };
	promise.value = value;
	promise.failed = failed;
	if (setPrototypeOf) setPrototypeOf(promise, ext._resolved);
	else extendShim(promise);
	if (createDeferred._profile) createDeferred._profile(true);
	return promise;
};

Deferred = function () {
	var promise = function (win, fail) { return promise.then(win, fail); };
	if (!count) timeout = setTimeout(noop, 1e9);
	++count;
	if (createDeferred._monitor) promise.monitor = createDeferred._monitor();
	if (setPrototypeOf) setPrototypeOf(promise, ext._unresolved);
	else extendShim(promise);
	if (createDeferred._profile) createDeferred._profile();
	this.promise = promise;
	this.resolve = this.resolve.bind(this);
	this.reject = this.reject.bind(this);
};

Deferred.prototype = {
	resolved: false,
	_settle: function (value) {
		var i, name, data, deps, dPromise, nuDeps;
		this.promise.value = value;
		if (setPrototypeOf) setPrototypeOf(this.promise, ext._resolved);
		else this.promise.resolved = true;
		deps = this.promise.dependencies;
		delete this.promise.dependencies;
		while (deps) {
			for (i = 0; (dPromise = deps[i]); ++i) {
				dPromise.value = value;
				dPromise.failed = this.failed;
				if (setPrototypeOf) setPrototypeOf(dPromise, ext._resolved);
				else dPromise.resolved = true;
				delete dPromise.pending;
				if (dPromise.dependencies) {
					if (nuDeps) push.apply(nuDeps, dPromise.dependencies);
					else nuDeps = dPromise.dependencies;
					delete dPromise.dependencies;
				}
			}
			deps = nuDeps;
			nuDeps = null;
		}
		if ((data = this.promise.pending)) {
			for (i = 0; (name = data[i]); ++i) {
				ext._onresolve[name].apply(this.promise, data[++i]);
			}
			delete this.promise.pending;
		}
		return this.promise;
	},
	resolve: function (value) {
		if (this.resolved) return this.promise;
		this.resolved = true;
		if (!--count) clearTimeout(timeout);
		if (this.promise.monitor) clearTimeout(this.promise.monitor);
		value = assimilate(value);
		if (isPromise(value)) {
			if (!value.resolved) {
				if (!value.dependencies) {
					value.dependencies = [];
				}
				value.dependencies.push(this.promise);
				if (this.promise.pending) {
					if (value.pending) {
						this.promise.pending.forEach(function (promise) {
							value.pending.push(promise);
						});
						this.promise.pending = value.pending;
						if (this.promise.dependencies) {
							this.promise.dependencies.forEach(function self(dPromise) {
								dPromise.pending = value.pending;
								if (dPromise.dependencies) {
									dPromise.dependencies.forEach(self);
								}
							});
						}
					} else {
						value.pending = this.promise.pending;
					}
				} else if (value.pending) {
					this.promise.pending = value.pending;
				} else {
					this.promise.pending = value.pending = [];
				}
				return this.promise;
			}
			this.promise.failed = value.failed;
			value = value.value;
		}
		return this._settle(value);
	},
	reject: function (error) {
		if (this.resolved) return this.promise;
		this.resolved = true;
		if (!--count) clearTimeout(timeout);
		if (this.promise.monitor) clearTimeout(this.promise.monitor);
		this.promise.failed = true;
		return this._settle(error);
	}
};

module.exports = createDeferred = function (value) {
	var length = arguments.length, d, waiting, initialized, result;
	if (!length) return new Deferred();
	if (length > 1) {
		d = new Deferred();
		waiting = 0;
		result = new Array(length);
		every.call(arguments, function (itemValue, index) {
			itemValue = assimilate(itemValue);
			if (!isPromise(itemValue)) {
				result[index] = itemValue;
				return true;
			}
			if (itemValue.resolved) {
				if (itemValue.failed) {
					d.reject(itemValue.value);
					return false;
				}
				result[index] = itemValue.value;
				return true;
			}
			++waiting;
			itemValue.done(function (resolvedValue) {
				result[index] = resolvedValue;
				if (!--waiting && initialized) d.resolve(result);
			}, d.reject);
			return true;
		});
		initialized = true;
		if (!waiting) d.resolve(result);
		return d.promise;
	}
	value = assimilate(value);
	if (isPromise(value)) return value;
	return resolve(value, isError(value));
};

createDeferred.Deferred = Deferred;
createDeferred.reject = function (value) { return resolve(value, true); };
createDeferred.resolve = function (value) {
	value = assimilate(value);
	if (isPromise(value)) return value;
	return resolve(value, false);
};
ext = require("./_ext");
assimilate = require("./assimilate");
