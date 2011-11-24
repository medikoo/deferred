// Return promise for given async function

'use strict';

var slice   = Array.prototype.slice
  , f       = require('es5-ext/lib/Function/functionalize')
  , toArray = require('es5-ext/lib/List/to-array').call

  , deferred  = require('./deferred')

  , apply;

apply = function (fn, scope, args, resolve) {
	fn.apply(scope, toArray(args).concat(function (error, result) {
		if (error == null) {
			resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
		} else {
			resolve(error);
		}
	}));
}

exports = module.exports = f(function () {
	var d = deferred();
	apply(this, null, arguments, d.resolve);
	return d.promise;
});

exports._apply = apply;