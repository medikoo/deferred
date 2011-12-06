// Return promise for given sync function

'use strict';

var bind     = Function.prototype.bind
  , call     = Function.prototype.call
  , silent   = require('es5-ext/lib/Function/prototype/silent')

  , deferred = require('./deferred');

exports = module.exports = function () {
	return deferred(silent.apply(this, arguments));
};

exports.call = call.bind(exports);
exports.bind = bind.bind(exports);
