'use strict';

var curry    = require('es5-ext/lib/Function/prototype/curry')
  , nextTick = require('clock/lib/next-tick')

  , deferred    = require('../deferred');

require('../_base').add('get', function (name) {
	var d = deferred();
	this._base._next('get', [name, d.resolve]);
	return d.promise;
}, function (name, resolve) {
	resolve(this._failed ? this._promise : this._value[name]);
});

module.exports = deferred;
