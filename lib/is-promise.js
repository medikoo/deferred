// Whether given object is a promise

'use strict';

var isFunction = require('es5-ext/lib/Function/is-function');

module.exports = function (o) {
	return isFunction(o) && (o === o.then);
};
