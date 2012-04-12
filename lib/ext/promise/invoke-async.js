// 'invokeAsync' - Promise extension
//
// promise.invokeAsync(name[, arg0[, arg1[, ...]]])
//
// On resolved object calls asynchronous method that takes callback
// (Node.js style).
// Do not pass callback, it's handled by internal implementation.
// 'name' can be method name or method itself.

'use strict';

var slice         = Array.prototype.slice
  , assertNotNull = require('es5-ext/lib/assert-not-null')
  , apply         = require('../utils/apply-async')
  , invoke        = require('./utils/invoke');

require('../../extend')('invokeAsync', [assertNotNull],
	function (args, resolve) {
		var fn = args[0];
		args = slice.call(args, 1);
		return invoke(this, fn, args, apply, resolve, true);
	});

module.exports = require('../../deferred');
