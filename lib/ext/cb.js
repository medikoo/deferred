'use strict';

var curry      = require('es5-ext/lib/Function/prototype/curry')
  , nextTick   = require('clock/lib/next-tick');

require('../_base').add('cb', function (cb) {
	this._base._next('cb', arguments);
}, function (cb) {
	if (this._failed) {
		cb(this._value);
	} else {
		cb(null, this._value);
	}
});

module.exports = require('../deferred');
