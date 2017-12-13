// Promise aware Array's reduce

"use strict";

var assign          = require("es5-ext/object/assign")
  , isValue         = require("es5-ext/object/is-value")
  , ensureValue     = require("es5-ext/object/valid-value")
  , callable        = require("es5-ext/object/valid-callable")
  , toNaturalNumber = require("es5-ext/number/to-pos-integer")
  , deferred        = require("../../deferred")
  , isPromise       = require("../../is-promise")
  , assimilate      = require("../../assimilate");

var call = Function.prototype.call, resolve = deferred.resolve, Reduce;

Reduce = function (list, cb, initial, initialized) {
	this.list = list;
	this.cb = cb;
	this.initialized = initialized;
	this.length = toNaturalNumber(list.length);

	initial = assimilate(initial);
	if (isPromise(initial)) {
		if (!initial.resolved) {
			assign(this, deferred());
			initial.done(
				function (resolvedInitial) {
					this.value = resolvedInitial;
					this.init();
				}.bind(this),
				this.reject
			);
			return this.promise;
		}
		this.value = initial.value;
		if (initial.failed) return initial;
	} else {
		this.value = initial;
	}

	return this.init();
};

Reduce.prototype = {
	current: 0,
	state: false,
	init: function () {
		while (this.current < this.length) {
			if (hasOwnProperty.call(this.list, this.current)) break;
			++this.current;
		}
		if (this.current === this.length) {
			if (!this.initialized) {
				throw new Error("Reduce of empty array with no initial value");
			}
			return this.resolve ? this.resolve(this.value) : resolve(this.value);
		}
		if (!this.promise) assign(this, deferred());
		this.processCb = this.processCb.bind(this);
		this.processValue = this.processValue.bind(this);
		this.continue();
		return this.promise;
	},
	continue: function () {
		var result;
		while (!this.state) {
			result = this.process();
			if (this.state !== "cb") break;
			result = this.processCb(result);
			if (this.state !== "value") break;
			this.processValue(result);
		}
	},
	process: function () {
		var value = assimilate(this.list[this.current]);
		if (isPromise(value)) {
			if (!value.resolved) {
				value.done(
					function (result) {
						result = this.processCb(result);
						if (this.state !== "value") return;
						this.processValue(result);
						if (!this.state) this.continue();
					}.bind(this),
					this.reject
				);
				return null;
			}
			if (value.failed) {
				this.reject(value.value);
				return null;
			}
			value = value.value;
		}
		this.state = "cb";
		return value;
	},
	processCb: function (value) {
		if (!this.initialized) {
			this.initialized = true;
			this.state = "value";
			return value;
		}
		if (this.cb) {
			try {
				value = call.call(this.cb, undefined, this.value, value, this.current, this.list);
			} catch (e) {
				this.reject(e);
				return null;
			}
			value = assimilate(value);
			if (isPromise(value)) {
				if (!value.resolved) {
					value.done(
						function (result) {
							this.state = "value";
							this.processValue(result);
							if (!this.state) this.continue();
						}.bind(this),
						this.reject
					);
					return null;
				}
				if (value.failed) {
					this.reject(value.value);
					return null;
				}
				value = value.value;
			}
		}
		this.state = "value";
		return value;
	},
	processValue: function (value) {
		this.value = value;
		while (++this.current < this.length) {
			if (hasOwnProperty.call(this.list, this.current)) {
				this.state = false;
				return;
			}
		}
		this.resolve(this.value);
	}
};

module.exports = function (cb/*, initial*/) {
	ensureValue(this);
	if (isValue(cb)) callable(cb);

	return new Reduce(this, cb, arguments[1], arguments.length > 1);
};
