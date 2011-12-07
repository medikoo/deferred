// Return promise for given async function

'use strict';

var bind    = Function.prototype.bind
  , call    = Function.prototype.call
  , slice   = Array.prototype.slice
  , toArray = require('es5-ext/lib/Object/prototype/to-array')

  , deferred  = require('./deferred')

  , apply;

apply = function (fn, scope, args, resolve) {
	fn.apply(scope, toArray.call(args).concat(function (error, result) {
		if (error == null) {
			resolve((arguments.length > 2) ? slice.call(arguments, 1) : result);
		} else {
			resolve(error);
		}
	}));
}

exports = module.exports = function () {
	var d = deferred();
	apply(this, null, arguments, d.resolve);
	return d.promise;
};
exports.call = call.bind(exports);
exports.bind = bind.bind(exports);

exports._apply = apply;
