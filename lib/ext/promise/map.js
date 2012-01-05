// Map extension for promise array-like values

'use strict';

var silent    = require('es5-ext/lib/Function/prototype/silent')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise')
  , map       = require('../array/map');

require('../../extend')('map', null, function (args, resolve) {
	var cb, cbs;
	if (this.failed) {
		resolve(this.promise);
	} else {
		resolve(silent.call(map.bind(this.value, args[0], args[1])));
	}
});

module.exports = deferred;
