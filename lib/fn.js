// Promise port for regular function

'use strict';

var bind     = Function.prototype.bind
  , call     = Function.prototype.call
  , silent   = require('es5-ext/lib/Function/prototype/silent')
  , deferred = require('./deferred')

  , method;

method = function () {
	return deferred(silent.apply(this, arguments));
};

deferred.fn = call.bind(method);
deferred.bfn = bind.bind(method);

module.exports = deferred;
