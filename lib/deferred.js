'use strict';

var every     = Array.prototype.every
  , isError   = require('es5-ext/lib/Error/is-error')
  , create    = require('es5-ext/lib/Object/prototype/plain-create')
  , isPromise = require('./is-promise')

  , promise, proto;

proto = {
	resolved: false,
	resolve: function (value) {
		if (this.resolved) {
			return this.promise;
		}
		this.resolved = true;
		return this.promise._base.resolve(value);
	}
};

module.exports = function deferred (value) {
	var o, l, args, d, waiting, initialized, result;
	if ((l = arguments.length)) {
		if (l > 1) {
			d = deferred();
			waiting = 0;
			result = Array(arguments.length);
			every.call(arguments, function (value, index) {
				if (isPromise(value)) {
					++waiting;
					value(function (value) {
						result[index] = value;
						if (!--waiting && initialized) {
							d.resolve(result);
						}
					}, d.resolve);
				} else if (isError(value)) {
					d.resolve(value);
					return false;
				} else {
					result[index] = value;
				}
				return true;
			});
			initialized = true;
			if (!waiting) {
				d.resolve(result);
			}
			return d.promise;
		} else {
			return promise(value);
		}
	}

	o = create.call(proto, {
		promise: promise()
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};

promise = require('./promise')
