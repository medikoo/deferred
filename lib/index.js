'use strict';

var merge = require('es5-ext/lib/Object/plain/merge').call;

module.exports = merge(require('./deferred'), {
	asyncToPromise: require('./async-to-promise'),
	syncToPromise:  require('./sync-to-promise'),
	delay:          require('./delay'),

	join:           require('./join/default'),
	all:            require('./join/all'),
	first:          require('./join/first')
});
