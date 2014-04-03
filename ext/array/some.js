// Promise aware Array's some

'use strict';

var assign     = require('es5-ext/object/assign')
  , value      = require('es5-ext/object/valid-value')
  , callable   = require('es5-ext/object/valid-callable')
  , deferred   = require('../../deferred')
  , isPromise  = require('../../is-promise')
  , assimilate = require('../../assimilate')

  , call = Function.prototype.call
  , resolve = deferred.resolve
  , Some;

Some = function (list, cb, context) {
	this.list = list;
	this.cb = cb;
	this.context = context;
	this.length = list.length >>> 0;

	while (this.current < this.length) {
		if (this.current in list) {
			assign(this, deferred());
			this.processCb = this.processCb.bind(this);
			this.processValue = this.processValue.bind(this);
			this.process();
			return this.promise;
		}
		++this.current;
	}
	return resolve(false);
};

Some.prototype = {
	current: 0,
	process: function () {
		var value = assimilate(this.list[this.current]);
		if (isPromise(value)) {
			if (!value.resolved) {
				value.done(this.processCb, this.reject);
				return;
			}
			if (value.failed) {
				this.reject(value.value);
				return;
			}
			value = value.value;
		}
		this.processCb(value);
	},
	processCb: function (value) {
		if (this.cb) {
			try {
				value = call.call(this.cb, this.context, value, this.current,
					this.list);
			} catch (e) {
				this.reject(e);
				return;
			}
			value = assimilate(value);
			if (isPromise(value)) {
				if (!value.resolved) {
					value.done(this.processValue, this.reject);
					return;
				}
				if (value.failed) {
					this.reject(value.value);
					return;
				}
				value = value.value;
			}
		}
		this.processValue(value);
	},
	processValue: function (value) {
		if (value) {
			this.resolve(true);
			return;
		}
		while (++this.current < this.length) {
			if (this.current in this.list) {
				this.process();
				return;
			}
		}
		this.resolve(false);
	}
};

module.exports = function (cb/*, thisArg*/) {
	value(this);
	((cb == null) || callable(cb));

	return new Some(this, cb, arguments[1]);
};
