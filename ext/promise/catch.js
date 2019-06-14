// 'catch' - Promise extension
//
// promise.catch(cb)
//
// Same as `then` but accepts only onFail callback

"use strict";

var isCallable = require("es5-ext/object/is-callable")
  , validValue = require("es5-ext/object/valid-value")
  , deferred   = require("../../deferred")
  , isPromise  = require("../../is-promise")
  , resolve    = deferred.resolve
  , reject     = deferred.reject;

deferred.extend(
	"catch",
	function (cb) {
		var def;
		validValue(cb);
		if (!this.pending) this.pending = [];
		def = deferred();
		this.pending.push("catch", [cb, def.resolve, def.reject]);
		return def.promise;
	},
	function (cb, localResolve, localReject) {
		var value;
		if (!this.failed) {
			localResolve(this.value);
			return;
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
			try {
				value = cb(this.value);
			} catch (e) {
				localReject(e);
				return;
			}
			localResolve(value);
			return;
		}
		localResolve(cb);
	},
	function (cb) {
		var value;
		validValue(cb);
		if (!this.failed) return this;
		if (isCallable(cb)) {
			if (isPromise(cb)) return cb;
			try { value = cb(this.value); }
			catch (e) { return reject(e); }
			return resolve(value);
		}
		return resolve(cb);
	}
);
