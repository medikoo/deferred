// Return promise for given async function

'use strict';

var f      = require('es5-ext/lib/Function/functionalize')
  , concat = require('es5-ext/lib/List/concat').call
  , slice  = require('es5-ext/lib/List/slice/call')

  , deferred  = require('./deferred')

  , apply;

apply = function (fn, scope, args, resolve) {
	fn.apply(scope, concat(args, function (error, result) {
		if (error == null) {
			resolve((arguments.length > 2) ? slice(arguments, 1) : result);
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