// Promise aware Array's some

"use strict";

var assign          = require("es5-ext/object/assign")
  , isValue         = require("es5-ext/object/is-value")
  , ensureValue     = require("es5-ext/object/valid-value")
  , callable        = require("es5-ext/object/valid-callable")
  , toNaturalNumber = require("es5-ext/number/to-pos-integer")
  , deferred        = require("../deferred")
  , isPromise       = require("../is-promise")
  , assimilate      = require("../assimilate");

var call = Function.prototype.call, resolve = deferred.resolve;

module.exports = function (resolvent) {
	var Iterator = function (list, cb, context) {
		this.list = list;
		this.cb = cb;
		this.context = context;
		this.length = toNaturalNumber(list.length);

		while (this.current < this.length) {
			if (this.current in list) {
				assign(this, deferred());
				this.processCb = this.processCb.bind(this);
				this.processValue = this.processValue.bind(this);
				this.continue();
				return this.promise;
			}
			++this.current;
		}
		return resolve(!resolvent);
	};

	Iterator.prototype = {
		current: 0,
		state: false,
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
			if (this.cb) {
				try {
					value = call.call(this.cb, this.context, value, this.current, this.list);
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
			if (Boolean(value) === resolvent) {
				this.resolve(resolvent);
				return;
			}
			while (++this.current < this.length) {
				if (this.current in this.list) {
					this.state = false;
					return;
				}
			}
			this.resolve(!resolvent);
		}
	};

	return function (cb/*, thisArg*/) {
		ensureValue(this);
		if (isValue(cb)) callable(cb);

		return new Iterator(this, cb, arguments[1]);
	};
};
