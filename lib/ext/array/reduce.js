'use strict';

var every          = Array.prototype.every
  , call           = Function.prototype.call
  , assertNotNull  = require('es5-ext/lib/assert-not-null')
  , isError        = require('es5-ext/lib/Error/is-error')
  , silent         = require('es5-ext/lib/Function/prototype/silent')
  , assertCallable = require('es5-ext/lib/Object/assert-callable')
  , create         = require('es5-ext/lib/Object/prototype/plain-create')
  , isPromise      = require('../../is-promise')
  , promise        = require('../../promise');

var proto = {
	iterate: function self(value, index) {
		if (!this.initialized) {
			this.initialized = true;
			return isError(this.current = value) ? false : true;
		}
		if (this.current && isPromise(this.current)) {
			this.current =
				this.current(this.processValue.bind(this, value, index));
		} else if (isError(this.current =
				this.processValue(value, index, this.current))) {
			return false;
		}
		return true;
	},
	processValue: function (value, index, accumulator) {
		if (this.cb) {
			if (value && isPromise(value)) {
				value = value(this.processCb.bind(this, accumulator, index));
			} else {
				value = this.processCb(accumulator, index, value);
			}
		}
		if (isPromise(value)) {
			value = value.valueOf();
		}
		return value;
	},
	processCb: function (accumulator, index, value) {
		return silent.call(this.cb, accumulator, value, index, this.list);
	}
};

module.exports = function (cb, initial) {
	var iterator;
	assertNotNull(this);
	if (cb != null) {
		assertCallable(cb);
	}
	if (initial && isError(initial)) {
		return promise(initial);
	}
	every.call(this, (iterator = create.call(proto, {
		initialized: (arguments.length > 1),
		current: initial,
		cb: cb,
		list: this
	})).iterate, iterator);

	if (!iterator.initialized) {
		throw new Error("Reduce of empty array with no initial value");
	}
	return promise(iterator.current);
};
