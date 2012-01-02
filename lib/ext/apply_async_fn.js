'use strict';

var slice   = Array.prototype.slice
  , toArray = require('es5-ext/lib/Object/prototype/to-array');

module.exports = function (fn, scope, args, resolve) {
	return fn.apply(scope, toArray.call(args).concat(function (error, result) {
		if (error == null) {
			resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
		} else {
			resolve(error);
		}
	}));
};
