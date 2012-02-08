'use strict';

var slice      = Array.prototype.slice
  , silent     = require('es5-ext/lib/Function/prototype/silent')
  , invoke     = require('./utils/invoke')
  , apply;

apply = function (fn, args, resolve) {
	return resolve(silent.apply(fn.bind(this), args));
};

require('../../extend')('invokeSync', null, function (args, resolve) {
	var fn = args[0];
	args = slice.call(args, 1);
	return invoke(this, fn, args, apply, resolve);
});

module.exports = require('../../deferred');
