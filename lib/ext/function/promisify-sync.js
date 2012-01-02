// Promisify synchronous function

'use strict';

var silent   = require('es5-ext/lib/Function/prototype/silent')
  , deferred = require('../../deferred')

module.exports = function () {
	return deferred(silent.apply(this, arguments));
};
