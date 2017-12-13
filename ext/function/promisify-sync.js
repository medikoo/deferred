// Promisify synchronous function

"use strict";

var isValue          = require("es5-ext/object/is-value")
  , callable         = require("es5-ext/object/valid-callable")
  , toNaturalNumber  = require("es5-ext/number/to-pos-integer")
  , deferred         = require("../../deferred")
  , isPromise        = require("../../is-promise")
  , processArguments = require("../_process-arguments");

var apply = Function.prototype.apply, applyFn;

applyFn = function (fn, args, resolve, reject) {
	var value;
	try {
		value = apply.call(fn, this, args);
	} catch (e) {
		reject(e);
		return;
	}
	resolve(value);
};

module.exports = function (length) {
	var fn, result;
	fn = callable(this);
	if (fn.returnsPromise) return fn;
	if (isValue(length)) length = toNaturalNumber(length);
	result = function () {
		var args, def;
		args = processArguments(arguments, length);

		if (isPromise(args)) {
			if (args.failed) return args;
			def = deferred();
			args.done(
				function (resolvedArgs) {
					applyFn.call(this, fn, resolvedArgs, def.resolve, def.reject);
				}.bind(this),
				def.reject
			);
		} else {
			def = deferred();
			applyFn.call(this, fn, args, def.resolve, def.reject);
		}

		return def.promise;
	};
	result.returnsPromise = true;
	return result;
};
