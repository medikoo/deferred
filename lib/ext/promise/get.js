// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

'use strict';

var reduce = Array.prototype.reduce
  , value  = require('es5-ext/lib/Object/valid-value');

require('../../extend')('get', [value], function (args, resolve) {
	var result;
	if (this.failed) {
		return resolve(this.promise);
	}
	try {
		result = reduce.call(args, function (obj, key) {
			return value(obj)[String(key)];
		}, this.value);
	} catch (e) {
		return resolve(e);
	}
	return resolve(result);
});

module.exports = require('../../deferred');
