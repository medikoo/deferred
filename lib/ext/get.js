'use strict';

var curry    = require('es5-ext/lib/Function/curry').call
  , nextTick = require('clock/lib/next-tick')

  , deferred    = require('../deferred');

require('../base').add('get', function (name) {
	var d = deferred();
	this._base.get(name, d.resolve);
	return d.promise;
}, function (name, resolve) {
	nextTick(curry(resolve, this._value[name]));
});
