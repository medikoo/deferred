// Assimilate eventual foreign promise

"use strict";

var isObject  = require("es5-ext/object/is-object")
  , isPromise = require("./is-promise")
  , deferred  = require("./deferred")
  , nextTick  = require("next-tick");

var getPrototypeOf = Object.getPrototypeOf;

module.exports = function self(value) {
	var then, done, def, resolve, reject;
	if (!value) return value;
	try { then = value.then; }
	catch (e) { return value; }
	if (typeof then !== "function") return value;
	if (isPromise(value)) return value;
	if (!isObject(value)) return value;
	if (!getPrototypeOf(value)) return value;
	try { done = value.done; }
	catch (ignore) {}
	def = deferred();
	resolve = function (resolvedValue) { def.resolve(self(resolvedValue)); };
	reject = function (resolvedReason) { def.reject(resolvedReason); };
	if (typeof done === "function") {
		try { done.call(value, resolve, reject); }
		catch (e) { return def.reject(e); }
		return def.promise;
	}
	try {
		then.call(
			value,
			function (resolvedValue) {
				nextTick(function () { resolve(resolvedValue); });
			},
			function (resolvedReason) {
				nextTick(function () { reject(resolvedReason); });
			}
		);
	} catch (e) {
		return def.reject(e);
	}
	return def.promise;
};
