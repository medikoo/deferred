// Turns async iterator into iterator that returns promises and can be processed
// by join methods

'use strict';

var promisify = require('./ext/function/promisify');

module.exports = function (iterator, method) {
	method = method || 'next';
	if (typeof method === 'string') {
		method = iterator[method];
	}
	return { next: promisify.call(iterator[method]).bind(iterator) };
};
