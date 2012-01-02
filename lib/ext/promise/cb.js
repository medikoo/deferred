'use strict';

require('../../extend')('cb', function (cb) {
	this._base.next('cb', arguments);
}, function (cb) {
	if (this.failed) {
		cb(this.value);
	} else {
		cb(null, this.value);
	}
});

module.exports = require('../../deferred');
