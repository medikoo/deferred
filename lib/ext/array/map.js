'use strict';

var every          = Array.prototype.every
  , call           = Function.prototype.call
  , assertNotNull  = require('es5-ext/lib/assert-not-null')
  , isError        = require('es5-ext/lib/Error/is-error')
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , create         = require('es5-ext/lib/Object/prototype/plain-create')
  , deferred       = require('../../deferred')
  , isPromise      = require('../../is-promise');

var proto = {
	iterate: function (value, index) {
		if (!this.cb && isError(value)) {
			this.d.resolve(value);
			return false;
		}
		++this.waiting;
		if (isPromise(value)) {
			if (isPromise(value = value.valueOf())) {
				value.end(this.processValue.bind(this, index), this.d.resolve);
			} else if (isError(value)) {
				this.d.resolve(value);
				return false;
			} else {
				return this.processValue(index, value);
			}
		} else {
			return this.processValue(index, value);
		}
		return true;
	},
	processValue: function self(index, value) {
		var d;
		if (this.d.promise._base.resolved) {
			return false;
		}
		if (this.cb) {
			if (!this.limit) {
				d = deferred();
				this.held.push(d.resolve);
				d.promise(self.bind(this, index, value));
				return true;
			}
			try {
				value = call.call(this.cb, this.context, value, index, this.list);
			} catch (e) {
				this.d.resolve(e);
				return false;
			}
			if (isPromise(value) && isPromise(value = value.valueOf())) {
				--this.limit;
				value.end(this.unhold.bind(this, index), this.d.resolve);
				return true;
			} else if (isError(value)) {
				this.d.resolve(value);
				return false;
			}
		}
		this.processResult(index, value);
		return true;
	},
	unhold: function (index, value) {
		this.processResult(index, value);
		if (!this.d.promise._base.resolved) {
			++this.limit;
			if (this.held.length) {
				this.held.shift()();
			}
		}
	},
	processResult: function (index, value) {
		if (this.d.promise._base.resolved) {
			return;
		}
		this.result[index] = value;
		if (!--this.waiting && this.initialized) {
			this.d.resolve(this.result);
		}
	}
};

module.exports = function (cb, thisArg, limit) {
	var result, iterator, d;
	assertNotNull(this);
	if (cb != null) {
		assertCallable(cb);
	}
	d = deferred();
	every.call(this, (iterator = create.call(proto, {
		d: d,
		cb: cb,
		held: [],
		limit: (limit >>> 0) || Infinity,
		list: this,
		context: thisArg,
		waiting: 0,
		result: new Array(this.length >>> 0)
	})).iterate, iterator);
	iterator.initialized = true;
	if (!iterator.waiting) {
		d.resolve(iterator.result);
	}
	return d.promise;
};
