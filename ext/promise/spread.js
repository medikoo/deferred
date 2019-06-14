// 'spread' - Promise extensions
//
// promise.spread(onsuccess, onerror)
//
// Matches eventual list result onto function arguments,
// otherwise works same as 'then' (promise function itself)

"use strict";

var spread     = require("es5-ext/function/#/spread")
  , isValue    = require("es5-ext/object/is-value")
  , callable   = require("es5-ext/object/valid-callable")
  , isCallable = require("es5-ext/object/is-callable")
  , isPromise  = require("../../is-promise")
  , deferred   = require("../../deferred");

var resolve = deferred.resolve, reject = deferred.reject;

deferred.extend(
	"spread",
	function (win, fail) {
		var def;
		if (isValue(win)) callable(win);
		if (!win && !isValue(fail)) return this;
		if (!this.pending) this.pending = [];
		def = deferred();
		this.pending.push("spread", [win, fail, def.resolve, def.reject]);
		return def.promise;
	},
	function (win, fail, localResolve, localReject) {
		var cb, value;
		cb = this.failed ? fail : win;
		if (!isValue(cb)) {
			if (this.failed) localReject(this.value);
			else localResolve(this.value);
		}
		if (isCallable(cb)) {
			if (isPromise(cb)) {
				if (cb.resolved) {
					if (cb.failed) localReject(cb.value);
					else localResolve(cb.value);
				} else {
					cb.done(localResolve, localReject);
				}
				return;
			}
			if (!this.failed) cb = spread.call(cb);
			try {
				value = cb(this.value);
			} catch (e) {
				localReject(e);
				return;
			}
			localResolve(value);
		} else {
			localResolve(cb);
		}
	},
	function (win, fail) {
		var cb, value;
		cb = this.failed ? fail : win;
		if (!isValue(cb)) return this;
		if (isCallable(cb)) {
			if (isPromise(cb)) return cb;
			if (!this.failed) cb = spread.call(cb);
			try { value = cb(this.value); }
			catch (e) { return reject(e); }
			return resolve(value);
		}
		return resolve(cb);
	}
);
