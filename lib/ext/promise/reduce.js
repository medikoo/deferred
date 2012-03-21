// 'reduce' - Promise extension
//
// promise.reduce(fn[, initial])
//
// Promise aware reduce for array-like results

'use strict';

require('./utils/array')('reduce', require('../array/reduce'));

module.exports = require('../../deferred');
