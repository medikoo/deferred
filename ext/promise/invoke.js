/* eslint max-statements: "off" */

// 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls method that returns immediately.
// 'name' can be method name or method itself.

"use strict";

var isValue          = require("es5-ext/object/is-value")
  , isCallable       = require("es5-ext/object/is-callable")
  , deferred         = require("../../deferred")
  , isPromise        = require("../../is-promise")
  , processArguments = require("../_process-arguments");

var slice = Array.prototype.slice
  , apply = Function.prototype.apply
  , reject = deferred.reject
  , applyFn;

applyFn = function (fn, args, localResolve, localReject) {
	var value;
	try { value = apply.call(fn, this, args); }
	catch (e) { return localReject(e); }
	return localResolve(value);
};

deferred.extend(
	"invoke",
	function (methodIgnored/*, …args*/) {
		var def;
		if (!this.pending) this.pending = [];
		def = deferred();
		this.pending.push("invoke", [arguments, def.resolve, def.reject]);
		return def.promise;
	},
	function (args, localResolve, localReject) {
		var fn;
		if (this.failed) {
			localReject(this.value);
			return;
		}

		if (!isValue(this.value)) {
			localReject(new TypeError("Cannot use null or undefined"));
			return;
		}

		fn = args[0];
		if (!isCallable(fn)) {
			fn = String(fn);
			if (!isCallable(this.value[fn])) {
				localReject(new TypeError(fn + " is not a function"));
				return;
			}
			fn = this.value[fn];
		}

		args = processArguments(slice.call(args, 1));
		if (isPromise(args)) {
			if (args.failed) {
				localReject(args.value);
				return;
			}
			args.done(
				function (argsResolved) {
					applyFn.call(this, fn, argsResolved, localResolve, localReject);
				}.bind(this.value),
				localReject
			);
		} else {
			applyFn.call(this.value, fn, args, localResolve, localReject);
		}
	},
	function (method/*, …args*/) {
		var args, def;
		if (this.failed) return this;

		if (!isValue(this.value)) {
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
			args.done(
				function (argsResolved) {
					applyFn.call(this, method, argsResolved, def.resolve, def.reject);
				}.bind(this.value),
				def.reject
			);
			return def.promise;
		}
		return applyFn.call(this.value, method, args, deferred, reject);
	}
);
