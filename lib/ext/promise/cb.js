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

var assertCallable = require('es5-ext/lib/Object/assert-callable')

  , b;

require('../../extend')('cb', function (cb) {
	if (cb != null) {
		assertCallable(cb);
		if (this._base.resolved) {
			b.call(this._base, cb);
		} else {
			this._base.next('cb', arguments);
		}
	}
	return this;
}, b = function (cb) {
	if (this.failed) {
		cb(this.value);
	} else {
		cb(null, this.value);
	}
});

module.exports = require('../../deferred');
