// Set universal promisify function on deferred object.

'use strict';

module.exports =
	Function.prototype.call.bind(require('./ext/function/promisify'));
