'use strict';

var curry      = require('es5-ext/lib/Function/prototype/curry')
  , nextTick   = require('clock/lib/next-tick');

require('../_base').add('cb', function (cb) {
	this._base.cb(cb);
}, function (cb) {
	nextTick(this._failed ? curry.call(cb, this._value, null) :
		curry.call(cb, null, this._value));
});

module.exports = require('../deferred');
