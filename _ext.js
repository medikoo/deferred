"use strict";

var callable   = require("es5-ext/object/valid-callable")
  , isCallable = require("es5-ext/object/is-callable")
  , isValue    = require("es5-ext/object/is-value")
  , d          = require("d")
  , ee         = require("event-emitter")
  , isPromise  = require("./is-promise");

var create = Object.create, defineProperty = Object.defineProperty, deferred, resolve, reject;

module.exports = exports = function (name, unres, onres, res) {
	name = String(name);
	callable(res);
	if (isValue(onres)) callable(onres);
	callable(unres);
	defineProperty(exports._unresolved, name, d(unres));
	exports._onresolve[name] = onres;
	defineProperty(exports._resolved, name, d(res));
	exports._names.push(name);
};

exports._names = ["done", "then", "valueOf"];

exports._unresolved = ee(
	create(Function.prototype, {
		then: d(function (win, fail) {
			var def;
			if (!this.pending) this.pending = [];
			def = deferred();
			this.pending.push("then", [win, fail, def.resolve, def.reject]);
			return def.promise;
		}),
		done: d(function (win, fail) {
			if (isValue(win)) callable(win);
			if (isValue(fail)) callable(fail);
			if (!this.pending) this.pending = [];
			this.pending.push("done", arguments);
		}),
		resolved: d(false),
		returnsPromise: d(true),
		valueOf: d(function () { return this; })
	})
);

exports._onresolve = {
	then: function (win, fail, promiseResolve, promiseReject) {
		var value, cont = this.failed ? fail : win;
		if (!isValue(cont)) {
			if (this.failed) promiseReject(this.value);
			else promiseResolve(this.value);
			return;
		}
		if (isCallable(cont)) {
			if (isPromise(cont)) {
				if (cont.resolved) {
					if (cont.failed) promiseReject(cont.value);
					else promiseResolve(cont.value);
					return;
				}
				cont.done(promiseResolve, promiseReject);
				return;
			}
			try {
				value = cont(this.value);
			} catch (e) {
				promiseReject(e);
				return;
			}
			promiseResolve(value);
			return;
		}
		promiseResolve(cont);
	},
	done: function (win, fail) {
		if (this.failed) {
			if (fail) {
				fail(this.value);
				return;
			}
			throw this.value;
		}
		if (win) win(this.value);
	}
};

exports._resolved = ee(
	create(Function.prototype, {
		then: d(function (win, fail) {
			var value, cont = this.failed ? fail : win;
			if (!isValue(cont)) return this;
			if (isCallable(cont)) {
				if (isPromise(cont)) return cont;
				try { value = cont(this.value); }
				catch (e) { return reject(e); }
				return resolve(value);
			}
			return resolve(cont);
		}),
		done: d(function (win, fail) {
			if (isValue(win)) callable(win);
			if (isValue(fail)) callable(fail);
			if (this.failed) {
				if (fail) {
					fail(this.value);
					return;
				}
				throw this.value;
			}
			if (win) win(this.value);
		}),
		resolved: d(true),
		returnsPromise: d(true),
		valueOf: d(function () { return this.value; })
	})
);

deferred = require("./deferred");
resolve = deferred.resolve;
reject = deferred.reject;
deferred.extend = exports;
