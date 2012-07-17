// Promisify synchronous function

var isArray          = Array.isArray
  , slice            = Array.prototype.slice
  , apply            = Function.prototype.apply
  , toArray          = require('es5-ext/lib/Array/from')
  , callable         = require('es5-ext/lib/Object/valid-callable')
  , deferred         = require('../../deferred')
  , isPromise        = require('../../is-promise')
  , processArguments = require('../_process-arguments')

  , applyFn;

applyFn = function (fn, args, resolve) {
	var value;
	try {
		value = apply.call(fn, this, args);
	} catch (e) {
		value = e;
	}
	resolve(value);
};

module.exports = function (length) {
	var fn, result;
	fn = callable(this);
	if (fn.returnsPromise) {
		return fn;
	}
	if (length != null) {
		length = length >>> 0;
	}
	result = function () {
		var args, def;
		args = processArguments(arguments, length);

		if (isPromise(args)) {
			if (args.failed) {
				return args;
			}
			def = deferred();
			args.end(function (args) {
				apply.call(this, fn, args, def.resolve);
			}.bind(this), def.resolve);
		} else {
			def = deferred();
			applyFn.call(this, fn, args, def.resolve);
		}

		return def.promise;
	};
	result.returnsPromise = true;
	return result;
};
