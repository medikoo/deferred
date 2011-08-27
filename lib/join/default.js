// Resolved when all resolved
// Always succeeds
// Function will be called only if preceding argument succeed
// Function will be called with resolved value of preceding argument
// Value is values of all promises

'use strict';

var base;

module.exports = function () {
	return Object.create(base).init(arguments);
};

base = require('./base');
