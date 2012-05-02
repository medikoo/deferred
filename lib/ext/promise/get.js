// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

'use strict';

var reduce        = Array.prototype.reduce
  , assertNotNull = require('es5-ext/lib/assert-not-null');

require('../../extend')('get', [assertNotNull], function (args, resolve) {
	var value;
	if (this.failed) {
		return resolve(this.promise);
	}
	try {
		value = reduce.call(args, function (obj, key) {
			assertNotNull(obj);
			return obj[String(key)];
		}, this.value);
	} catch (e) {
		return resolve(e);
	}
	return resolve(value);
});

module.exports = require('../../deferred');
