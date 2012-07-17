'use strict';

var isArray   = Array.isArray
  , push      = Array.prototype.push
  , slice     = Array.prototype.slice
  , some      = Array.prototype.some
  , arrayOf   = require('es5-ext/lib/Array/of')
  , deferred  = require('../deferred')
  , isPromise = require('../is-promise');

module.exports = function (args, length) {
	var i, l, promised;
	if ((length != null) && (args.length !== length)) {
		args = slice.call(args, 0, length);
		if (args.length < length) {
			push.apply(args, Array(length - args.length));
		}
	}
	for (i = 0, l = args.length; i < l; ++i) {
		if (isPromise(args[i])) {
			if (args[i].resolved) {
				if (args[i].failed) {
					return args[i];
				}
				args[i] = args[i].value;
			} else if (l > 1) {
				return deferred.apply(null, args);
			} else {
				return args[0](arrayOf);
			}
		}
	}
	return args;
};
