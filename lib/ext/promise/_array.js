// Used by promise extensions that are based on array extensions.

'use strict';

var callable = require('es5-ext/lib/Object/valid-callable')
  , silent   = require('es5-ext/lib/Function/prototype/silent')
  , extend   = require('../../extend');

module.exports = function (name, ext) {
	extend(name, [function (cb) {
		(cb == null) || callable(cb);
	}], function (args, resolve) {
		var cb, cbs;
		if (this.failed) {
			return resolve(this.promise);
		} else {
			return resolve(silent.call(ext).call(this.value,
				args[0], args[1], args[2]));
		}
	});
};
