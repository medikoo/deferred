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

require('../../extend')('cb', function (win, fail) {
	(win != null) && assertCallable(win);
	(fail != null) && assertCallable(fail);
	if (win || fail) {
		if (this._base.resolved) {
			b.apply(this._base, arguments);
		} else {
			this._base.next('cb', arguments);
		}
	}
	return this;
}, b = function (win, fail) {
	if (this.failed) {
		(fail ? fail : win)(this.value);
	} else if (win) {
		if (arguments.length > 1) {
			win(this.value);
		} else {
			win(null, this.value);
		}
	}
});

module.exports = require('../../deferred');
