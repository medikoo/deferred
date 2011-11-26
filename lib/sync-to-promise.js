// Return promise for given sync function

'use strict';

var f        = require('es5-ext/lib/Function/functionalize')
  , silent   = require('es5-ext/lib/Function/prototype/silent')

  , deferred = require('./deferred');

module.exports = f(function () {
	return deferred(silent.apply(this, arguments));
});
