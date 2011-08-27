'use strict';

var toArray = require('es5-ext/lib/List/to-array').call;

module.exports = function (name, fn) {
	require('../port').add(name, function () {
		if (this.failed) {
			return this.then;
		} else {
			return fn.apply(null, [this.value].concat(toArray(arguments)));
		}
	});
};

