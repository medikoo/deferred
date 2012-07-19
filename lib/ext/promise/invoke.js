// 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls method that returns immediately.
// 'name' can be method name or method itself.

'use strict';

var slice            = Array.prototype.slice
  , apply            = Function.prototype.apply
  , toArray          = require('es5-ext/lib/Array/from')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , deferred         = require('../../deferred')
  , isPromise        = require('../../is-promise')
  , promise          = require('../../promise')
  , processArguments = require('../_process-arguments')

  , applyFn

applyFn = function (fn, args) {
	try {
		return apply.call(fn, this, args);
	} catch (e) {
		return e;
	}
};

deferred.extend('invoke', function (name) {
	var def;
	if (!this.pending) {
		this.pending = [];
	}
	def = deferred();
	this.pending.push('invoke', [arguments, def.resolve]);
	return def.promise;
}, function (args, resolve) {
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
			resolve(applyFn.call(this, fn, args));
		}.bind(this.value), resolve);
	} else {
		resolve(applyFn.call(this.value, fn, args));
	}
}, function (fn) {
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
			def.resolve(applyFn.call(this, fn, args));
		}.bind(this.value), def.resolve);
		return def.promise;
	} else {
		return promise(applyFn.call(this.value, fn, args));
	}
});

module.exports = deferred;
