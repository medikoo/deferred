'use strict';

var map       = Array.prototype.map
  , silent    = require('es5-ext/lib/Function/prototype/silent')
  , deferred  = require('../deferred')
  , isPromise = require('../is-promise');

require('../extend')('map', null, function (args, resolve) {
	var cb, cbs;
	if (this.failed) {
		resolve(this.promise);
	} else {
		cb = args[0].bind(args[1]);
		cbs = silent.bind(cb);
		resolve(deferred.apply(null, map.call(this.value, function (value) {
			return isPromise(value) ? value(cb) : cbs(value);
		})));
	}
});

module.exports = deferred;
