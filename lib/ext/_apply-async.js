// Asynchronous function handler

'use strict';

var slice   = Array.prototype.slice
  , toArray = require('es5-ext/lib/Array/from');

module.exports = function (fn, args, resolve) {
	args = toArray(args);
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
