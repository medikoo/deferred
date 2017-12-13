/* eslint max-statements: "off" */

// Limit number of concurrent function executions (to cLimit number).
// Limited calls are queued. Optionaly maximum queue length can also be
// controlled with qLimit value, any calls that would reach over that limit
// would be discarded (its promise would resolve with "Too many calls" error)

"use strict";

var toPosInt   = require("es5-ext/number/to-pos-integer")
  , callable   = require("es5-ext/object/valid-callable")
  , isValue    = require("es5-ext/object/is-value")
  , eeUnify    = require("event-emitter/unify")
  , deferred   = require("../../deferred")
  , isPromise  = require("../../is-promise")
  , assimilate = require("../../assimilate");

var resolve = deferred.resolve
  , reject = deferred.reject
  , apply = Function.prototype.apply
  , max = Math.max
  , gateReject;

require("../promise/finally");

gateReject = function () {
	var e = new Error("Too many calls at the gate");
	e.code = "DEFERRED_REJECTED_AT_GATE";
	e.type = "deferred-gate-rejected";
	return reject(e);
};

module.exports = function (cLimit, qLimit) {
	var fn, count, decrement, unload, queue, run, result;
	fn = callable(this);
	cLimit = max(toPosInt(cLimit), 1);
	qLimit = !isValue(qLimit) || isNaN(qLimit) ? Infinity : toPosInt(qLimit);
	count = 0;
	queue = [];

	run = function (thisArg, args, def) {
		var localResult;
		try {
			localResult = apply.call(fn, thisArg, args);
		} catch (e) {
			if (!def) return reject(e);
			def.reject(e);
			return unload();
		}
		localResult = assimilate(localResult);
		if (isPromise(localResult)) {
			if (def) eeUnify(def.promise, localResult);
			if (!localResult.resolved) {
				++count;
				if (def) def.resolve(localResult);
				return localResult.finally(decrement);
			}
			if (!localResult.failed) localResult = localResult.value;
		}
		if (!def) return resolve(localResult);
		def.resolve(localResult);
		return unload();
	};

	decrement = function () {
		--count;
		unload();
	};

	unload = function () {
		var data;
		if ((data = queue.shift())) run.apply(null, data);
	};

	result = function () {
		var def;
		if (count >= cLimit) {
			if (queue.length < qLimit) {
				def = deferred();
				queue.push([this, arguments, def]);
				return def.promise;
			}
			return gateReject();
		}
		return run(this, arguments);
	};
	result.returnsPromise = true;
	return result;
};
