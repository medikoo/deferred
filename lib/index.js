'use strict';

var merge = require('es5-ext/lib/Object/prototype/merge');

module.exports = merge.call(require('./deferred'), {
	delay:          require('./delay')
});

require('./async-fn');
require('./fn');
require('./ext/promise/cb');
require('./ext/promise/get');
require('./ext/promise/invoke-async');
require('./ext/promise/invoke');
require('./ext/promise/map');
require('./ext/promise/match');
