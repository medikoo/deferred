'use strict';

var assertCallable = require('es5-ext/lib/Object/assert-callable')
  , front          = require('./_front')
  , back           = require('./_back')
	, deferred       = require('./deferred');

module.exports = function (name, f, b) {
	f && assertCallable(f) && b && assertCallable(b);
	if (!f) {
		if (!b) {
			throw new Error("No methods provided");
		}
		f = function () {
			var d = deferred();
			this._base._next(name, [arguments, d.resolve]);
			return d.promise;
		};
	}
	front[name] = f;
	if (b) {
		back[name] = b;
	}
	return deferred;
};
