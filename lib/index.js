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

require('./ext/all');
require('./ext/cb');
require('./ext/first');
require('./ext/get');
require('./ext/invoke-async');
require('./ext/invoke');
require('./ext/join');
require('./ext/match');
