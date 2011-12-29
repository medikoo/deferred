'use strict';

var merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	delay:          require('./delay')
});

require('./async-fn');
require('./fn');
require('./ext/cb');
require('./ext/get');
require('./ext/invoke-async');
require('./ext/invoke');
require('./ext/map');
require('./ext/match');
