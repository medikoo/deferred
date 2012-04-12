// (DRY) Used by promise extensions that are based on array extensions

'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , extend         = require('../../../extend');

module.exports = function (name, ext) {
	extend(name, [function (cb) {
		return (cb != null) && assertCallable(cb);
	}], function (args, resolve) {
		var cb, cbs;
		if (this.failed) {
			return resolve(this.promise);
		} else {
			return resolve(silent.call(ext.bind(this.value,
				args[0], args[1], args[2])));
		}
	});
};
