// Dynamic queue handler
// Allows to create a promise queue, where new promises can be added to queue until last promise in
// a queue resolves. Queue promise resolves with `undefined` value, when last promises resolves.

"use strict";

var aFrom          = require("es5-ext/array/from")
  , ensureIterable = require("es5-ext/iterable/validate-object")
  , assign         = require("es5-ext/object/assign")
  , deferred       = require("./deferred")
  , isPromise      = require("./is-promise")
  , assimilate     = require("./assimilate");

var DynamicQueue;

module.exports = DynamicQueue = function (list) {
	if (!(this instanceof DynamicQueue)) return new DynamicQueue(list);
	list = aFrom(ensureIterable(list));

	assign(this, deferred());
	list.every(this.add, this);
	if (!this.waiting) {
		this.resolve();
		return null;
	}
	this.initialized = true;
	return null;
};

DynamicQueue.prototype = {
	waiting: 0,
	initialized: false,
	add: function (value) {
		if (this.promise.resolved) throw new Error("Queue was already resolved");
		++this.waiting;
		value = assimilate(value);
		if (isPromise(value)) {
			if (!value.resolved) {
				value.done(this._processValue.bind(this), this.reject);
				return true;
			}
			if (value.failed) {
				this.reject(value.value);
				return false;
			}
		}
		return this._processValue();
	},
	_processValue: function () {
		if (this.promise.resolved) return null;
		if (!--this.waiting && this.initialized) this.resolve();
		return true;
	}
};
