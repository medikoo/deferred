'use strict';

var call  = Function.prototype.call
  , merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	isPromise:      require('./is-promise'),
	delay:          call.bind(require('./ext/function/delay')),
	promisify:      call.bind(require('./ext/function/promisify')),
	promisifyAsync: call.bind(require('./ext/function/promisify-async')),
	map:            call.bind(require('./ext/array/map')),
	queue:          call.bind(require('./ext/array/queue')),
	reduce:         call.bind(require('./ext/array/reduce'))
});

require('./ext/promise/get');
require('./ext/promise/invoke');
require('./ext/promise/map');
require('./ext/promise/match');
require('./ext/promise/queue');
require('./ext/promise/reduce');
