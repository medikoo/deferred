// Promise aware Array's map

'use strict';

var every     = Array.prototype.every
  , call      = Function.prototype.call
  , isError   = require('es5-ext/lib/Error/is-error')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , value     = require('es5-ext/lib/Object/valid-value')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise');

var Map = function (list, cb, thisArg, limit) {
	this.list = list;
	this.cb = cb;
	this.context = thisArg;
	this.limit = (limit >>> 0) || Infinity;

	this.d = deferred();
	this.result = new Array(list.length >>> 0)
	this.held = [];
};

Map.prototype = {
	waiting: 0,
	iterate: function (value, index) {
		if (!this.cb && isError(value)) {
			this.d.resolve(value);
			return false;
		}
		++this.waiting;
		if (isPromise(value)) {
			if (!value.resolved) {
				value.end(this.processValue.bind(this, index), this.d.resolve);
				return true;
			}
			value = value.value;
			if (isError(value)) {
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
		if (this.d.promise.resolved) {
			return false;
		}
		if (this.cb) {
			if (!this.limit) {
				d = deferred();
				this.held.push(d.resolve);
				d.promise.end(self.bind(this, index, value));
				return true;
			}
			try {
				value = call.call(this.cb, this.context, value, index, this.list);
			} catch (e) {
				this.d.resolve(e);
				return false;
			}
			if (isPromise(value)) {
				if (!value.resolved) {
					--this.limit;
					value.end(function (value) {
						++this.limit;
						this.unhold(index, value);
					}.bind(this), this.d.resolve);
					return true;
				}
				value = value.value;
			}
			if (isError(value)) {
				this.d.resolve(value);
				return false;
			}
		}
		this.unhold(index, value);
		return true;
	},
	unhold: function (index, value) {
		this.processResult(index, value);
		if (!this.d.promise.resolved) {
			if (this.held.length) {
				this.held.shift()();
			}
		}
	},
	processResult: function (index, value) {
		if (this.d.promise.resolved) {
			return;
		}
		this.result[index] = value;
		if (!--this.waiting && this.initialized) {
			this.d.resolve(this.result);
		}
	}
};

module.exports = function (cb, thisArg, limit) {
	var iterator;
	value(this);
	(cb == null) || callable(cb);
	every.call(this, (iterator = new Map(this, cb, thisArg, limit)).iterate,
		iterator);
	iterator.initialized = true;
	if (!iterator.waiting) {
		iterator.d.resolve(iterator.result);
	}
	return iterator.d.promise;
};
