// Queue extension for promise array-like values

'use strict';

require('./utils/array')('queue', require('../array/queue'));

module.exports = require('../../deferred')
