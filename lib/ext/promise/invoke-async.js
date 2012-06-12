// 'invokeAsync' - Promise extension
//
// promise.invokeAsync(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls asynchronous method that takes callback
// (Node.js style).
// Do not pass callback, it's handled by internal implementation.
// 'name' can be method name or method itself.

'use strict';

var slice  = Array.prototype.slice
  , value  = require('es5-ext/lib/Object/valid-value')
  , apply  = require('../_apply-async')
  , invoke = require('./_invoke');

require('../../extend')('invokeAsync', [value],
	function (args, resolve) {
		var fn = args[0];
		args = slice.call(args, 1);
		return invoke(this, fn, args, apply, resolve, true);
	});

module.exports = require('../../deferred');
