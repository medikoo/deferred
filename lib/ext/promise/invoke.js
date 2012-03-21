// 'invoke' - Promise extension
//
// promise.invoke(name[, arg0[, arg1[, ...]]])
//
// On resolved object call method. Method may be synchronous or asynchronous.
// It may not produce desired result for some corner cases:
// 1. Synchronouns method that takes variable ammount of arguments (mind that in
//    all cases callback is passed which handles eventual asynchronous
//    function)
// 2. Asynchronous function that also returns some object synchronously.
//
// For that cases use more specific invokeSync or invokeAsync extensions.

'use strict';

var slice      = Array.prototype.slice
  , apply      = require('../utils/apply')
  , invoke     = require('./utils/invoke');

require('../../extend')('invoke', null, function (args, resolve) {
	var fn = args[0];
	args = slice.call(args, 1);
	return invoke(this, fn, args, apply, resolve, true);
});

module.exports = require('../../deferred');
