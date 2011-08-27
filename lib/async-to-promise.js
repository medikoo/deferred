// Return promise for given async function

'use strict';

var f      = require('es5-ext/lib/Function/functionalize')
  , concat = require('es5-ext/lib/List/concat').call
  , slice  = require('es5-ext/lib/List/slice').call

  , deferred  = require('./deferred');

module.exports = f(function () {
	var d = deferred();
	this.apply(null, concat(arguments, function (error, result) {
		if (error === null) {
			d.resolve((arguments.length > 2) ? slice(arguments, 1) : result);
		} else {
			d.resolve(error);
		}
	}));
	return d.promise;
});
