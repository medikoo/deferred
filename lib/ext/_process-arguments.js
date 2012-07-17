'use strict';

var isArray   = Array.isArray
  , push      = Array.prototype.push
  , slice     = Array.prototype.slice
  , some      = Array.prototype.some
  , deferred  = require('../deferred')
  , isPromise = require('../is-promise');

module.exports = function (args, length) {
	if ((length != null) && (args.length !== length)) {
		args = slice.call(args, 0, length);
		if (args.length < length) {
			push.apply(args, Array(length - args.length));
		}
	}
	if (some.call(args, function (value, index) {
		if (isPromise(value)) {
			if (value.resolved) {
				if (value.failed) {
					args = value;
					return true;
				}
				args[index] = value.value;
			} else {
				return true;
			}
		}
	})) {
		return isArray(args) ? deferred.apply(null, args)(function (args) {
			return isArray(args) ? args : [args];
		}) : args;
	}
	return args;
};
