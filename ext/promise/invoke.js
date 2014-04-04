// 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls method that returns immediately.
// 'name' can be method name or method itself.

'use strict';

var isCallable       = require('es5-ext/object/is-callable')
  , deferred         = require('../../deferred')
  , isPromise        = require('../../is-promise')
  , processArguments = require('../_process-arguments')

  , slice = Array.prototype.slice, apply = Function.prototype.apply
  , reject = deferred.reject
  , applyFn;

applyFn = function (fn, args, resolve, reject) {
	var value;
	try {
		value = apply.call(fn, this, args);
	} catch (e) {
		return reject(e);
	}
	return resolve(value);
};

deferred.extend('invoke', function (method/*, …args*/) {
	var def;
	if (!this.pending) this.pending = [];
	def = deferred();
	this.pending.push('invoke', [arguments, def.resolve, def.reject]);
	return def.promise;
}, function (args, resolve, reject) {
	var fn;
	if (this.failed) {
		reject(this.value);
		return;
	}

	if (this.value == null) {
		reject(new TypeError("Cannot use null or undefined"));
		return;
	}

	fn = args[0];
	if (!isCallable(fn)) {
		fn = String(fn);
		if (!isCallable(this.value[fn])) {
			reject(new TypeError(fn + " is not a function"));
			return;
		}
		fn = this.value[fn];
	}

	args = processArguments(slice.call(args, 1));
	if (isPromise(args)) {
		if (args.failed) {
			reject(args.value);
			return;
		}
		args.done(function (args) {
			applyFn.call(this, fn, args, resolve, reject);
		}.bind(this.value), reject);
	} else {
		applyFn.call(this.value, fn, args, resolve, reject);
	}
}, function (method/*, …args*/) {
	var args, def;
	if (this.failed) return this;

	if (this.value == null) {
		return reject(new TypeError("Cannot use null or undefined"));
	}

	if (!isCallable(method)) {
		method = String(method);
		if (!isCallable(this.value[method])) {
			return reject(new TypeError(method + " is not a function"));
		}
		method = this.value[method];
	}

	args = processArguments(slice.call(arguments, 1));
	if (isPromise(args)) {
		if (args.failed) return args;
		def = deferred();
		args.done(function (args) {
			applyFn.call(this, method, args, def.resolve, def.reject);
		}.bind(this.value), def.reject);
		return def.promise;
	}
	return applyFn.call(this.value, method, args, deferred, reject);
});
