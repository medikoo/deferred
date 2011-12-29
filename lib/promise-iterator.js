// Turns async iterator into iterator that returns promises and can be processed
// by join methods

'use strict';

var deferred = require('./deferred');

require('./async-fn');

module.exports = function (iterator, method) {
	method = method || 'next';
	if (typeof method === 'string') {
		method = iterator[method];
	}
	return { next: deferred.bafn(iterator[method].bind(iterator)) };
};
