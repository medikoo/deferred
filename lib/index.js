'use strict';

var merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	syncToPromise:  require('./sync-to-promise'),
	delay:          require('./delay')
});

require('./async-fn');
require('./ext/all');
require('./ext/cb');
require('./ext/first');
require('./ext/get');
require('./ext/invoke-async');
require('./ext/invoke');
require('./ext/join');
require('./ext/match');
