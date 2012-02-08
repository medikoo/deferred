'use strict';

var slice      = Array.prototype.slice
  , apply      = require('../utils/apply-async')
  , invoke     = require('./utils/invoke');

require('../../extend')('invokeAsync', null, function (args, resolve) {
	var fn = args[0];
	args = slice.call(args, 1);
	return invoke(this, fn, args, apply, resolve, true);
});

module.exports = require('../../deferred');
