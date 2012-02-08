'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
	, deferred       = require('./deferred')
  , promise        = require('./promise')

  , front = promise.front, back = promise.back;

module.exports = function (name, f, b) {
	f && assertCallable(f) && b && assertCallable(b);
	if (!f) {
		if (!b) {
			throw new Error("No methods provided");
		}
		f = function () {
			if (this._base.resolved) {
				return b.call(this._base, arguments, promise);
			} else {
				var d = deferred();
				this._base.next(name, [arguments, d.resolve]);
				return d.promise;
			}
		};
	}
	front[name] = f;
	if (b) {
		back[name] = b;
	}
	return deferred;
};
