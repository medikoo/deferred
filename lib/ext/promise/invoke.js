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
