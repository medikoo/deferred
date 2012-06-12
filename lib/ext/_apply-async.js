// Asynchronous function handler

'use strict';

var slice   = Array.prototype.slice
  , apply   = Function.prototype.apply
  , toArray = require('es5-ext/lib/Array/from');

module.exports = function (fn, args, resolve) {
	args = toArray(args);
	try {
		if (fn.returnsPromise) {
			return resolve(apply.call(fn, this, args));
		} else {
			return apply.call(fn,  this, args.concat(function (error, result) {
				if (error == null) {
					resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
				} else {
					resolve(error);
				}
			}));
		}
	} catch (e) {
		resolve(e);
	}
};
