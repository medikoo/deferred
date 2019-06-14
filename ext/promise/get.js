// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

"use strict";

var value    = require("es5-ext/object/valid-value")
  , deferred = require("../../deferred");

var reduce = Array.prototype.reduce, resolve = deferred.resolve, reject = deferred.reject;

deferred.extend(
	"get",
	function (/* …name*/) {
		var def;
		if (!this.pending) this.pending = [];
		def = deferred();
		this.pending.push("get", [arguments, def.resolve, def.reject]);
		return def.promise;
	},
	function (args, localResolve, localReject) {
		var result;
		if (this.failed) localReject(this.value);
		try {
			result = reduce.call(
				args, function (obj, key) { return value(obj)[String(key)]; }, this.value
			);
		} catch (e) {
			localReject(e);
			return;
		}
		localResolve(result);
	},
	function (/* …name*/) {
		var result;
		if (this.failed) return this;
		try {
			result = reduce.call(
				arguments, function (obj, key) { return value(obj)[String(key)]; }, this.value
			);
		}
		catch (e) { return reject(e); }
		return resolve(result);
	}
);
