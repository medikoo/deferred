// 'timeout' - Promise extension
//
// promise.timeout(ms)
//
// Resolves with resolution value of context promise assuming it settles before timeout time passes
// Otherwise resolves with timeout rejection

"use strict";

var customError   = require("es5-ext/error/custom")
  , isValue       = require("es5-ext/object/is-value")
  , nextTick      = require("next-tick")
  , ensureTimeout = require("timers-ext/valid-timeout")
  , deferred      = require("../../deferred");

deferred.extend(
	"timeout",
	function (timeout) {
		var def;
		var callback = function () {
			if (this.resolved) return;
			def.reject(customError("Operation timeout", "DEFERRED_TIMEOUT"));
		}.bind(this);
		if (isValue(timeout)) setTimeout(callback, ensureTimeout(timeout));
		else nextTick(callback);
		if (!this.pending) this.pending = [];
		def = deferred();
		this.pending.push("timeout", [def.promise, def.resolve]);
		return def.promise;
	},
	function (promise, resolve) { if (!promise.resolved) resolve(this); },
	function (timeout) {
		if (isValue(timeout)) ensureTimeout(timeout);
		return this;
	}
);
