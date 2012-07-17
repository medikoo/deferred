// 'invokeAsync' - Promise extension
//
// promise.invokeAsync(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls asynchronous method that takes callback
// (Node.js style).
// Do not pass callback, it's handled by internal implementation.
// 'name' can be method name or method itself.

'use strict';

var slice            = Array.prototype.slice
  , apply            = Function.prototype.apply
  , defineProperty   = Object.defineProperty
  , toArray          = require('es5-ext/lib/Array/from')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , d                = require('es5-ext/lib/Object/descriptor')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , deferred         = require('../../deferred')
  , isPromise        = require('../../is-promise')
  , promise          = require('../../promise')
  , processArguments = require('../_process-arguments')

  , applyFn

applyFn = function (fn, args, resolve) {
	var result
	if (fn.returnsPromise) {
		try {
			result = apply.call(fn, this, args);
		} catch (e) {
			result = e;
		}
		return resolve(result);
	}
	args = toArray(args).concat(function (error, result) {
		if (error == null) {
			resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
		} else {
			resolve(error);
		}
	});
	try {
		apply.call(fn, this, args);
	} catch (e) {
		resolve(e);
	}
};

defineProperty(promise.unresolved, 'invokeAsync', d(function (name) {
	var def;
	if (!this.pending) {
		this.pending = [];
	}
	def = deferred();
	this.pending.push('invokeAsync', [arguments, def.resolve]);
	return def.promise;
}));

promise.onswitch.invokeAsync = function (args, resolve) {
	var fn;
	if (this.failed) {
		resolve(this);
		return;
	}

	if (this.value == null) {
		resolve(new TypeError("Cannot use null or undefined"));
		return;
	}

	fn = args[0];
	if (!isCallable(fn)) {
		fn = String(fn);
		if (!isCallable(this.value[fn])) {
			resolve(new TypeError(fn + " is not a function"));
			return;
		}
		fn = this.value[fn];
	}

	args = processArguments(slice.call(args, 1));
	if (isPromise(args)) {
		if (args.failed) {
			resolve(args);
			return;
		}
		args.end(function (args) {
			applyFn.call(this, fn, args, resolve);
		}.bind(this.value), resolve);
	} else {
		applyFn.call(this.value, fn, args, resolve);
	}
};

defineProperty(promise.resolved, 'invokeAsync', d(function (fn) {
	var args, def;
	if (this.failed) {
		return this;
	}

	if (this.value == null) {
		return promise(new TypeError("Cannot use null or undefined"));
	}

	if (!isCallable(fn)) {
		fn = String(fn);
		if (!isCallable(this.value[fn])) {
			return promise(new TypeError(fn + " is not a function"));
		}
		fn = this.value[fn];
	}

	args = processArguments(slice.call(arguments, 1));
	if (isPromise(args)) {
		if (args.failed) {
			return args;
		}
		def = deferred();
		args.end(function (args) {
			applyFn.call(this, fn, args, def.resolve);
		}.bind(this.value), def.resolve);
	} else if (fn.returnsPromise) {
		return applyFn.call(this.value, fn, args, promise);
	} else {
		def = deferred();
		applyFn.call(this.value, fn, args, def.resolve);
	}
	return def.promise;
}));

module.exports = require('../../deferred');
