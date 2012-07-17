// 'cb' - Promise extension
//
// promise.cb(cb)
//
// Handles asynchronous function style callback.
// Returns self promise. Callback is optional.
//
// Useful when we want to configure typical asynchronous function that's
// internally configured with promises, with this extension we expose promise
// (it's returned immediately), so end programmer may work with returned promise
// or pass callback, it's up to his preference.
// Extension can be used as follows:
//
// var foo = function (arg1, arg2, cb) {
//     var d = deferred();
//     // ... implementation
//     return d.promise.cb(cb);
// };

'use strict';

var defineProperty = Object.defineProperty
  , d              = require('es5-ext/lib/Object/descriptor')
  , callable       = require('es5-ext/lib/Object/valid-callable')
  , promise        = require('../../promise')

defineProperty(promise.unresolved, 'cb', d(function (win, fail) {
	(win == null) || callable(win);
	(fail == null) || callable(fail);
	if (win || fail) {
		if (!this.pending) {
			this.pending = [];
		}
		this.pending.push('cb', arguments);
	}
	return this;
}));
promise.onswitch.cb = function (win, fail) {
	if (this.failed) {
		if (arguments.length > 1) {
			if (fail) {
				fail(this.value);
			}
		} else {
			win(this.value);
		}
	} else if (win) {
		if (arguments.length > 1) {
			win(this.value);
		} else {
			win(null, this.value);
		}
	}
};
defineProperty(promise.resolved, 'cb', d(function (win, fail) {
	(win == null) || callable(win);
	(fail == null) || callable(fail);
	if (this.failed) {
		if (arguments.length > 1) {
			if (fail) {
				fail(this.value);
			}
		} else {
			win(this.value);
		}
	} else if (win) {
		if (arguments.length > 1) {
			win(this.value);
		} else {
			win(null, this.value);
		}
	}
	return this;
}));

module.exports = require('../../deferred');
