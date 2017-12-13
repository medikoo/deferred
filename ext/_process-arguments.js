"use strict";

var arrayOf    = require("es5-ext/array/of")
  , isValue    = require("es5-ext/object/is-value")
  , deferred   = require("../deferred")
  , isPromise  = require("../is-promise")
  , assimilate = require("../assimilate");

var push = Array.prototype.push, slice = Array.prototype.slice;

module.exports = function (args, length) {
	var i, arg;
	if (isValue(length) && args.length !== length) {
		args = slice.call(args, 0, length);
		if (args.length < length) {
			push.apply(args, new Array(length - args.length));
		}
	} else {
		length = args.length;
	}
	for (i = 0; i < length; ++i) {
		arg = assimilate(args[i]);
		if (isPromise(arg)) {
			if (!arg.resolved) {
				if (length > 1) return deferred.apply(null, args);
				return arg(arrayOf);
			}
			if (arg.failed) return arg;
			args[i] = arg.value;
		}
	}
	return args;
};
