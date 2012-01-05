// Factory for promise extensions that use array extensions

'use strict';

var silent = require('es5-ext/lib/Function/prototype/silent')
  , extend = require('../../../extend');

module.exports = function (name, ext) {
	extend(name, null, function (args, resolve) {
		var cb, cbs;
		if (this.failed) {
			resolve(this.promise);
		} else {
			resolve(silent.call(ext.bind(this.value, args[0], args[1])));
		}
	});
};
