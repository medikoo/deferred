'use strict';

var call  = Function.prototype.call
  , merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	delay:     call.bind(require('./ext/function/delay')),
	promisify: call.bind(require('./ext/function/promisify')),
	map:       call.bind(require('./ext/array/map')),
	reduce:    call.bind(require('./ext/array/reduce'))
});

require('./ext/promise/cb');
require('./ext/promise/get');
require('./ext/promise/invoke');
require('./ext/promise/map');
require('./ext/promise/match');
