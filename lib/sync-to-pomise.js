// Return promise for given sync function

'use strict';

var f      = require('es5-ext/lib/Function/functionalize')
  , promise  = require('./promise');

module.exports = f(function () {
	try {
		return promise(this.apply(null, arguments));
	} catch (e) {
		return promise(e);
	}
});
