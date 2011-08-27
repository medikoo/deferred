'use strict';

var merge = require('es5-ext/lib/Object/plain/merge').call;

module.exports = merge(require('./deferred'), {
	asyncToPromise: require('./async-to-promise'),
	syncToPromise:  require('./sync-to-promise'),
	delay:          require('./delay'),
	promise:        require('./promise'),

	join:           require('./join/default'),
	all:            require('./join/all'),
	first:          require('./join/first')
});

require('./ports/all');
require('./ports/cb');
require('./ports/first');
require('./ports/invoke');
require('./ports/invoke-async');
require('./ports/join');
