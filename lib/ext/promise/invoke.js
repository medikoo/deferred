'use strict';

var slice      = Array.prototype.slice
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , silent     = require('es5-ext/lib/Function/prototype/silent')
  , invoke     = require('./utils/invoke')
  , apply;

apply = function (fn, args, resolve) {
	resolve(silent.apply(fn.bind(this), args));
};

require('../../extend')('invoke', null, function (args, resolve) {
	var fn = args[0];
	args = slice.call(args, 1);
	invoke(this, fn, args, apply, resolve);
});

module.exports = require('../../deferred');
