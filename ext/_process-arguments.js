'use strict';

var arrayOf    = require('es5-ext/array/of')
  , deferred   = require('../deferred')
  , isPromise  = require('../is-promise')
  , assimilate = require('../assimilate')

  , push = Array.prototype.push, slice = Array.prototype.slice;

module.exports = function (args, length) {
	var i, l, arg;
	if ((length != null) && (args.length !== length)) {
		args = slice.call(args, 0, length);
		if (args.length < length) {
			push.apply(args, new Array(length - args.length));
		}
	}
	for (i = 0, l = args.length; i < l; ++i) {
		arg = assimilate(args[i]);
		if (isPromise(arg)) {
			if (!arg.resolved) {
				if (l > 1) return deferred.apply(null, args);
				return arg(arrayOf);
			}
			if (arg.failed) return arg;
			args[i] = arg.value;
		}
	}
	return args;
};
