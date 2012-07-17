// 'match' - Promise extensions
//
// promise.match(onsuccess, onerror)
//
// Matches eventual list result onto function arguments,
// otherwise works same as 'then' (promise function itself)

'use strict';

var defineProperty = Object.defineProperty
  , match          = require('es5-ext/lib/Function/prototype/match')
  , d              = require('es5-ext/lib/Object/descriptor')
  , isCallable     = require('es5-ext/lib/Object/is-callable')
  , deferred       = require('../../deferred')
  , promise        = require('../../promise')

defineProperty(promise.unresolved, 'match', d(function (win, fail) {
	var def;
	if ((win == null) && (fail == null)) {
		return this;
	}
	if (!this.pending) {
		this.pending = [];
	}
	def = deferred();
	// console.log("ADD PEND", 'match', [win, fail, def.resolve]);
	this.pending.push('match', [win, fail, def.resolve]);
	return def.promise;
}));

promise.onswitch.match = function (win, fail, resolve) {
	var cb, value;
	cb = this.failed ? fail : win;
	if (cb == null) {
		resolve(this);
	}
	if (isCallable(cb)) {
		if (!this.failed) {
			cb = match.call(cb);
		}
		try {
			value = cb(this.value);
		} catch (e) {
			value = e;
		}
		resolve(value);
	} else {
		resolve(cb);
	}
};
defineProperty(promise.resolved, 'match', d(function (win, fail) {
	var cb, value;
	cb = this.failed ? fail : win;
	if (cb == null) {
		return this;
	}
	if (isCallable(cb)) {
		if (!this.failed) {
			cb = match.call(cb);
		}
		try {
			value = cb(this.value);
		} catch (e) {
			value = e;
		}
		return promise(value);
	} else {
		return promise(cb);
	}
}));

module.exports = require('../../deferred');
