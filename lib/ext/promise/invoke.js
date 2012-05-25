// 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls method that returns immediately.
// 'name' can be method name or method itself.

'use strict';

var slice  = Array.prototype.slice
  , silent = require('es5-ext/lib/Function/prototype/silent')
  , value  = require('es5-ext/lib/Object/valid-value')
  , invoke = require('./utils/invoke')
  , apply;

apply = function (fn, args, resolve) {
	return resolve(silent.call(fn).apply(this, args));
};

require('../../extend')('invoke', [value],
	function (args, resolve) {
		var fn = args[0];
		args = slice.call(args, 1);
		return invoke(this, fn, args, apply, resolve);
	});

module.exports = require('../../deferred');
