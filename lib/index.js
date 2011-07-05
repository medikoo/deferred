'use strict';

var merge = require('es5-ext/lib/Object/plain/merge').call;

module.exports = merge(require('./deferred'), {
	asyncToPromise: require('./async-to-promise'),
	isPromise:      require('./is-promise'),
	promise:        require('./promise'),

	join:           require('./chain/join'),
	all:            require('./chain/all'),
	first:          require('./chain/first')
});
