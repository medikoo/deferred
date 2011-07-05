// Resolved when all resolved
// Always succeeds
// Function will be called only if preceding argument succeed
// Function will get value of preceding promise
// Value is values of all promises, if promise return more than one value, then
// values are wrapped into array.

'use strict';

var base = require('./base');

module.exports = function () {
	return Object.create(base).init(arguments);
};
