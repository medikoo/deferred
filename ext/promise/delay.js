// 'delay' - Promise extension
//
// promise.delay(timeout)
//
// Returns promise that resolves with same value but delayed in time

'use strict';

var nextTick      = require('next-tick')
  , ensureTimeout = require('timers-ext/valid-timeout')
  , deferred      = require('../../deferred');

deferred.extend('delay', function (/*timeout*/) {
	var def, timeout = arguments[0];
	if (timeout !== undefined) timeout = ensureTimeout(timeout);
	if (!this.pending) this.pending = [];
	def = deferred();
	this.pending.push('delay', [timeout, def.resolve, def.reject]);
	return def.promise;
}, function (timeout, resolve, reject) {
	var delay;
	if (this.failed) {
		reject(this.value);
		return;
	}
	if (timeout === undefined) delay = nextTick;
	else delay = setTimeout;
	delay(resolve.bind(null, this.value), timeout);
}, function (/*timeout*/) {
	var def, timeout = arguments[0], delay;
	if (timeout !== undefined) timeout = ensureTimeout(timeout);
	if (this.failed) return this;
	def = deferred();
	if (timeout === undefined) delay = nextTick;
	else delay = setTimeout;
	delay(def.resolve.bind(def, this.value), timeout);
	return def.promise;
});
