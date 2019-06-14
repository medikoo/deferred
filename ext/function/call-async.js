// Call asynchronous function

"use strict";

var toArray          = require("es5-ext/array/to-array")
  , isValue          = require("es5-ext/object/is-value")
  , callable         = require("es5-ext/object/valid-callable")
  , deferred         = require("../../deferred")
  , isPromise        = require("../../is-promise")
  , processArguments = require("../_process-arguments");

var slice = Array.prototype.slice, apply = Function.prototype.apply, applyFn, callAsync;

applyFn = function (fn, args, def) {
	args = toArray(args);
	apply.call(
		fn,
		this,
		args.concat(function (error, result) {
			if (isValue(error)) def.reject(error);
			else def.resolve(arguments.length > 2 ? slice.call(arguments, 1) : result);
		})
	);
};

callAsync = function (fn, length, context, args) {
	var def;
	args = processArguments(args, length);
	if (isPromise(args)) {
		if (args.failed) return args;
		def = deferred();
		args.done(function (resolvedArgs) {
			if (fn.returnsPromise) {
				apply.call(fn, context, resolvedArgs);
				return;
			}
			try { applyFn.call(context, fn, resolvedArgs, def); } catch (e) { def.reject(e); }
		}, def.reject);
		return def.promise;
	}
	if (fn.returnsPromise) return apply.call(fn, context, args);
	def = deferred();
	try {
		applyFn.call(context, fn, args, def);
	} catch (e) {
		def.reject(e);
		throw e;
	}
	return def.promise;
};

module.exports = exports = function (context/*, …args*/) {
	return callAsync(callable(this), null, context, slice.call(arguments, 1));
};

Object.defineProperty(exports, "_base", {
	configurable: true,
	enumerable: false,
	writable: true,
	value: callAsync
});
