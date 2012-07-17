// Used by promise extensions that are based on array extensions.

'use strict';

var defineProperty = Object.defineProperty
  , d              = require('es5-ext/lib/Object/descriptor')
  , callable       = require('es5-ext/lib/Object/valid-callable')
  , deferred       = require('../../deferred')
  , promise        = require('../../promise');

module.exports = function (name, ext) {
	defineProperty(promise.unresolved, name, d(function (cb) {
		var def;
		(cb == null) || callable(cb);
		if (!this.pending) {
			this.pending = [];
		}
		def = deferred();
		this.pending.push(name, [arguments, def.resolve]);
		return def.promise;
	}));

	promise.onswitch[name] = function (args, resolve) {
		var result;
		if (this.failed) {
			resolve(this.value);
		} else {
			try {
				result = ext.call(this.value, args[0], args[1], args[2]);
			} catch (e) {
				result = e;
			}
			resolve(result);
		}
	};

	defineProperty(promise.resolved, name, d(function (cb, arg2, arg3) {
		var result;
		(cb == null) || callable(cb);
		if (this.failed) {
			return this;
		} else {
			try {
				return ext.call(this.value, cb, arg2, arg3);
			} catch (e) {
				return promise(e);
			}
		}
	}));
};
