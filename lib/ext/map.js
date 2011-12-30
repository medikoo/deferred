'use strict';

var map       = Array.prototype.map
  , silent    = require('es5-ext/lib/Function/prototype/silent')
  , base      = require('../_base')
  , deferred  = require('../deferred')
  , isPromise = require('../is-promise');

require('../_base').add('map', function (cb, thisArg) {
	var d = deferred();
	this._base._next('map', [cb, thisArg, d.resolve]);
	return d.promise;
}, function (cb, thisArg, resolve) {
	var cbs;
	if (this._failed) {
		resolve(this._promise);
	} else {
		cb = cb.bind(thisArg);
		cbs = silent.bind(cb);
		resolve(deferred.apply(null, map.call(this._value, function (value) {
			return isPromise(value) ? value(cb) : cbs(value);
		})));
	}
});

module.exports = deferred;
