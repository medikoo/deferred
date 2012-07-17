// Promise aware Array's reduce

'use strict';

var every     = Array.prototype.every
  , call      = Function.prototype.call
  , isError   = require('es5-ext/lib/Error/is-error')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , value     = require('es5-ext/lib/Object/valid-value')
  , isPromise = require('../../is-promise')
  , promise   = require('../../promise');

var Iterator = function (initialized, current, cb, list) {
	this.initialized = initialized;
	this.current = current;
	this.cb = cb;
	this.list = list;
};

Iterator.prototype = {
	iterate: function self(value, index) {
		if (!this.initialized) {
			this.initialized = true;
			return isError(this.current = value) ? false : true;
		}
		if (this.current && isPromise(this.current)) {
			if (this.current.resolved) {
				this.current = this.current.value;
				if (isError(this.current)) {
					return false;
				}
			} else {
				this.current =
					this.current(this.processValue.bind(this, value, index));
				return true;
			}
		}
		if (isError(this.current =
			 this.processValue(value, index, this.current))) {
			return false;
		}
		return true;
	},
	processValue: function (value, index, accumulator) {
		if (this.cb) {
			if (value && isPromise(value)) {
				if (value.resolved) {
					value = value.value;
					if (isError(value)) {
						return value;
					}
					value = this.processCb(accumulator, index, value);
				} else {
					value = value(this.processCb.bind(this, accumulator, index));
				}
			} else {
				value = this.processCb(accumulator, index, value);
			}
		}
		if (isPromise(value) && value.resolved) {
			value = value.value;
		}
		return value;
	},
	processCb: function (accumulator, index, value) {
		try {
			return this.cb(accumulator, value, index, this.list);
		} catch (e) {
			return e;
		}
	}
};

module.exports = function (cb, initial) {
	var iterator;
	value(this);
	(cb == null) || callable(cb);

	if (initial && isError(initial)) {
		return promise(initial);
	}

	iterator = new Iterator((arguments.length > 1), initial, cb, this);
	every.call(this, iterator.iterate, iterator);

	if (!iterator.initialized) {
		throw new Error("Reduce of empty array with no initial value");
	}

	return promise(iterator.current);
};
