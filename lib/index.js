'use strict';

var call  = Function.prototype.call
  , merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	delay:     call.bind(require('./ext/function/delay')),
	promisify: require('./promisify')
});

require('./ext/promise/cb');
require('./ext/promise/get');
require('./ext/promise/invoke-async');
require('./ext/promise/invoke');
require('./ext/promise/map');
require('./ext/promise/match');
