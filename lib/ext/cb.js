'use strict';

var curry      = require('es5-ext/lib/Function/curry').call
  , nextTick   = require('clock/lib/next-tick');

require('../base').add('cb', function (cb) {
	this._base.cb(cb);
}, function (cb) {
	nextTick(this._failed ? curry(cb, this._value, null) :
		curry(cb, null, this._value));
});
