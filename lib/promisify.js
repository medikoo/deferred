// Set universal promisify function on deferred object.

'use strict';

module.exports =
	Function.prototype.bind.bind(require('./ext/function/promisify'));
