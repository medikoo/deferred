// Used by promise extensions that are based on array extensions.

"use strict";

var isValue  = require("es5-ext/object/is-value")
  , callable = require("es5-ext/object/valid-callable")
  , deferred = require("../../deferred");

var deferredReject = deferred.reject;

module.exports = function (name, ext) {
	deferred.extend(
		name,
		function (cb) {
			var def;
			if (isValue(cb)) callable(cb);
			if (!this.pending) this.pending = [];
			def = deferred();
			this.pending.push(name, [arguments, def.resolve, def.reject]);
			return def.promise;
		},
		function (args, resolve, reject) {
			var result;
			if (this.failed) {
				reject(this.value);
				return;
			}
			try {
				result = ext.apply(this.value, args);
			} catch (e) {
				reject(e);
				return;
			}
			resolve(result);
		},
		function (cb) {
			if (isValue(cb)) callable(cb);
			if (this.failed) return this;
			try { return ext.apply(this.value, arguments); }
			catch (e) { return deferredReject(e); }
		}
	);
};
