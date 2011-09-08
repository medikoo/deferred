// Return promise for given sync function

'use strict';

var f        = require('es5-ext/lib/Function/functionalize')
  , silent   = require('es5-ext/lib/Function/silent').apply

  , deferred = require('./deferred');

module.exports = f(function () {
	return deferred(silent(this, arguments));
});
