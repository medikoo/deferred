// Through this function we setup extensions on promise objects.
// See extensions in ext folder to get idea how it works.
//
// name - Name of extension (name of function that would be called on promise)
// f    - Front handler - Invoked when extension is called, should be provided
//        if we want to return something else than promise of eventual
//        result value
// b    - Back handler - invoked when origin promise is resolved, can be omitted
//        if no action is expected.

'use strict';

var forEach    = Array.prototype.forEach
  , callable   = require('es5-ext/lib/Object/valid-callable')
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , deferred   = require('./deferred')
  , promise    = require('./promise')

  , front = promise.front, back = promise.back;

module.exports = function (name, f, b) {
	(b == null) || callable(b);
	if (!isCallable(f)) {
		f && forEach.call(f, function (validator) {
			(validator == null) || callable(validator);
		});
		if (!b) {
			throw new Error("No methods provided");
		}
		front[name] = function () {
			var args;
			if (f) {
				args = arguments;
				forEach.call(f, function (validator, i) {
					validator && validator(args[i]);
				});
			}
			if (this._base.resolved) {
				return b.call(this._base, arguments, promise);
			} else {
				var d = deferred();
				this._base.next(name, [arguments, d.resolve]);
				return d.promise;
			}
		};
	} else {
		front[name] = f;
	}
	if (b) {
		back[name] = b;
	}
	return deferred;
};
