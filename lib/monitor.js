// Run if you want to monitor unresolved promises (in properly working
// application there should be no promises that are never resolved)

var max            = Math.max
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , isCallable     = require('es5-ext/lib/Object/is-callable')
  , toUinteger     = require('es5-ext/lib/Number/to-uinteger')
  , deferred       = require('./deferred')
  , promise        = require('./promise');

exports = module.exports = function (timeout, cb) {
	if (timeout === false) {
		// Cancel monitor
		delete promise.monitor;
		delete exports.timeout;
		delete exports.callback;
		return;
	}
	exports.timeout = timeout = max(toUinteger(timeout) || 5000, 50);
	if (cb == null) {
		if ((typeof console !== 'undefined') && console &&
				isCallable(console.error)) {
			cb = function (e) {
				console.error("UNRESOLVED PROMISE:" +
					((e.stack && e.stack.toString()) || 'no stack available'));
			};
		}
	} else {
		assertCallable(cb);
	}
	exports.callback = cb;

	promise.monitor = function () {
		var e = new Error("Unresolved promise");
		return setTimeout(function () {
			cb && cb(e);
		}, timeout);
	};
};
