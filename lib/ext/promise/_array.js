// Used by promise extensions that are based on array extensions.

'use strict';

var callable = require('es5-ext/lib/Object/valid-callable')
  , extend   = require('../../extend');

module.exports = function (name, ext) {
	extend(name, [function (cb) {
		(cb == null) || callable(cb);
	}], function (args, resolve) {
		var result;
		if (this.failed) {
			return resolve(this.promise);
		} else {
			try {
				result = ext.call(this.value, args[0], args[1], args[2]);
			} catch (e) {
				return resolve(e);
			}
			return resolve(result);
		}
	});
};
