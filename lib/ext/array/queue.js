'use strict';

var call           = Function.prototype.call
  , max            = Math.max
  , assertNotNull  = require('es5-ext/lib/assert-not-null')
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , deferred       = require('../../deferred')
  , map            = require('./map')
  , isPromise      = require('../../is-promise');

module.exports = function (limit, cb, thisArg) {
	var waiting, shift, promise;
	assertNotNull(this);
	assertCallable(cb);
	if (!(limit = max(limit, 0))) {
		return map.call(this, cb, thisArg);
	}
	waiting = [];
	shift = function () {
		if (!promise._base.resolved) {
			++limit;
			if (waiting.length) {
				waiting.shift()();
			}
		}
	};
	return promise = map.call(this, function self (item, index, list) {
		var value, d;
		if (limit) {
			value = call.call(cb, thisArg, item, index, list);
			if (isPromise(value) && isPromise(value = value.valueOf())) {
				--limit;
				value.end(shift, null);
			}
			return value;
		} else {
			d = deferred();
			waiting.push(d.resolve);
			return d.promise(self.bind(this, item, index, list));
		}
	});
};
