// Promise port for asynchronous function

'use strict';

var bind     = Function.prototype.bind
  , call     = Function.prototype.call
  , apply    = require('./_apply_async_fn')
  , deferred = require('./deferred')

  , method;

method = function () {
	var d = deferred();
	apply(this, null, arguments, d.resolve);
	return d.promise;
};

deferred.afn = call.bind(method);
deferred.bafn = bind.bind(method);

module.exports = deferred;
