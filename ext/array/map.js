// Promise aware Array's map

"use strict";

var assign          = require("es5-ext/object/assign")
  , isValue         = require("es5-ext/object/is-value")
  , ensureValue     = require("es5-ext/object/valid-value")
  , callable        = require("es5-ext/object/valid-callable")
  , toNaturalNumber = require("es5-ext/number/to-pos-integer")
  , deferred        = require("../../deferred")
  , isPromise       = require("../../is-promise")
  , assimilate      = require("../../assimilate");

var every = Array.prototype.every, call = Function.prototype.call, DMap;

DMap = function (list, cb, context) {
	this.list = list;
	this.cb = cb;
	this.context = context;
	this.result = new Array(toNaturalNumber(list.length));

	assign(this, deferred());
	every.call(list, this.process, this);
	if (!this.waiting) return this.resolve(this.result);
	this.initialized = true;

	return this.promise;
};

DMap.prototype = {
	waiting: 0,
	initialized: false,
	process: function (value, index) {
		++this.waiting;
		value = assimilate(value);
		if (isPromise(value)) {
			if (!value.resolved) {
				value.done(this.processCb.bind(this, index), this.reject);
				return true;
			}
			if (value.failed) {
				this.reject(value.value);
				return false;
			}
			value = value.value;
		}
		return this.processCb(index, value);
	},
	processCb: function (index, value) {
		if (this.promise.resolved) return false;
		if (this.cb) {
			try {
				value = call.call(this.cb, this.context, value, index, this.list);
			} catch (e) {
				this.reject(e);
				return false;
			}
			value = assimilate(value);
			if (isPromise(value)) {
				if (!value.resolved) {
					value.done(this.processValue.bind(this, index), this.reject);
					return true;
				}
				if (value.failed) {
					this.reject(value.value);
					return false;
				}
				value = value.value;
			}
		}
		this.processValue(index, value);
		return true;
	},
	processValue: function (index, value) {
		if (this.promise.resolved) return;
		this.result[index] = value;
		if (!--this.waiting && this.initialized) this.resolve(this.result);
	}
};

module.exports = function (cb/*, thisArg*/) {
	ensureValue(this);
	if (isValue(cb)) callable(cb);

	return new DMap(this, cb, arguments[1]);
};
