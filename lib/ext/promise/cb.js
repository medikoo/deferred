// 'cb' - Promise extension
//
// promise.cb(cb)
//
// Handles asynchronous function style callback (which is run in next event loop
// the earliest). Returns self promise. Callback is optional.
//
// Useful when we want to configure typical asynchronous function which logic is
// internally configured with promises.
//
// Extension can be used as follows:
//
// var foo = function (arg1, arg2, cb) {
//     var d = deferred();
//     // ... implementation
//     return d.promise.cb(cb);
// };
//
// `cb` extension returns promise and handles eventual callback (optional)

'use strict';

var callable   = require('es5-ext/lib/Object/valid-callable')
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , deferred = require('../../deferred')

  , nextTick;

if (typeof setImmediate === "function") {
	// W3C Draft
	// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	nextTick = setImmediate;
} else if ((typeof process !== "undefined") && process &&
		isCallable(process.nextTick)) {
	// Node.js
	nextTick = process.nextTick;
} else {
	// Wide available standard
	nextTick = function (task) {
		return setTimeout(task, 0);
	};
}

deferred.extend('cb', function (cb) {
	if (cb == null) {
		return this;
	}
	callable(cb);
	nextTick(function () {
		if (this.resolved) {
			if (this.failed) {
				cb(this.value);
			} else {
				cb(null, this.value);
			}
		} else {
			if (!this.pending) {
				this.pending = [];
			}
			this.pending.push('cb', [cb]);
		}
	}.bind(this));
	return this;
}, function (cb) {
	if (this.failed) {
		cb(this.value);
	} else {
		cb(null, this.value);
	}
}, function (cb) {
	if (cb == null) {
		return this;
	}
	callable(cb);
	nextTick(function () {
		if (this.failed) {
			cb(this.value);
		} else {
			cb(null, this.value);
		}
	}.bind(this));
	return this;
});
