// Turns async iterator into iterator that returns promises and can be processed
// by join methods

'use strict';

var ba2p = require('./async-to-promise').bind

module.exports = function (iterator, method) {
	method = method || 'next';
	if (typeof method === 'string') {
		method = iterator[method];
	}
	return { next: ba2p(iterator[method].bind(iterator)) };
};
