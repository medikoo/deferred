'use strict';

require('../extend')('get', null, function (args, resolve) {
	resolve(this._failed ? this._promise : this._value[args[0]]);
});

module.exports = require('../deferred');
