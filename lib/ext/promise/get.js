// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

'use strict';

var reduce = Array.prototype.reduce
  , valid  = require('es5-ext/lib/valid-value');

require('../../extend')('get', [valid], function (args, resolve) {
	var value;
	if (this.failed) {
		return resolve(this.promise);
	}
	try {
		value = reduce.call(args, function (obj, key) {
			return valid(obj) && obj[String(key)];
		}, this.value);
	} catch (e) {
		return resolve(e);
	}
	return resolve(value);
});

module.exports = require('../../deferred');
