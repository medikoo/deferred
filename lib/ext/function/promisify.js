// Promisify asynchronous function

'use strict';

var apply     = require('../_apply-async')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise');

module.exports = require('./_promisify')(function (fn, args) {
	var deferral = deferred();

	if (isPromise(args)) {
		args(function (args) {
			apply.call(this, fn, args, deferral.resolve);
		}.bind(this));
	} else {
		apply.call(this, fn, args, deferral.resolve);
	}

	return deferral.promise;
});
