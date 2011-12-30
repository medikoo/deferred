'use strict';

require('../extend')('cb', function (cb) {
	this._base._next('cb', arguments);
}, function (cb) {
	if (this._failed) {
		cb(this._value);
	} else {
		cb(null, this._value);
	}
});

module.exports = require('../deferred');
