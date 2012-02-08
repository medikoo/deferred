'use strict';

require('../../extend')('get', null, function (args, resolve) {
	return resolve(this.failed ? this.promise : this.value[args[0]]);
});

module.exports = require('../../deferred');
