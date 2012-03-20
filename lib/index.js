'use strict';

var call  = Function.prototype.call
  , merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	isPromise:      require('./is-promise'),
	delay:          call.bind(require('./ext/function/delay')),
	promisify:      call.bind(require('./ext/function/promisify')),
	promisifyAsync: call.bind(require('./ext/function/promisify-async')),
	promisifySync:  call.bind(require('./ext/function/promisify-sync')),
	map:            call.bind(require('./ext/array/map')),
	reduce:         call.bind(require('./ext/array/reduce'))
});

require('./ext/promise/get');
require('./ext/promise/invoke');
require('./ext/promise/invoke-async');
require('./ext/promise/invoke-sync');
require('./ext/promise/map');
require('./ext/promise/match');
require('./ext/promise/reduce');
