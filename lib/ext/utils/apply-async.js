'use strict';

var slice   = Array.prototype.slice
  , toArray = require('es5-ext/lib/Object/prototype/to-array');

module.exports = function (fn, args, resolve, length) {
	args = (length != null) ? slice.call(args, 0, length) : toArray.call(args);
	while (args.length < length) {
		args.push(undefined);
	}
	try {
		return fn.apply(this, args.concat(function (error, result) {
			if (error == null) {
				resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
			} else {
				resolve(error);
			}
		}));
	} catch (e) {
		resolve(e);
	}
};
