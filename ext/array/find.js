// Promise aware Array's find
// Additionally differs from some that it returns *first in order* item that matches constraint

'use strict';

var assign     = require('es5-ext/object/assign')
  , value      = require('es5-ext/object/valid-value')
  , callable   = require('es5-ext/object/valid-callable')
  , deferred   = require('../../deferred')
  , isPromise  = require('../../is-promise')
  , assimilate = require('../../assimilate')

  , call = Function.prototype.call
  , resolve = deferred.resolve
  , Find;

Find = function (list, cb, context) {
	this.list = list;
	this.cb = cb;
	this.context = context;
	this.length = list.length >>> 0;

	while (this.current < this.length) {
		if (this.current in list) {
			assign(this, deferred());
			this.processCb = this.processCb.bind(this);
			this.process();
			return this.promise;
		}
		++this.current;
	}
	return resolve(undefined);
};

Find.prototype = {
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
	processCb: function (listValue) {
		var value;
		if (this.cb) {
			try {
				value = call.call(this.cb, this.context, listValue, this.current, this.list);
			} catch (e) {
				this.reject(e);
				return;
			}
			value = assimilate(value);
			if (isPromise(value)) {
				if (!value.resolved) {
					value.done(this.processValue.bind(this, listValue), this.reject);
					return;
				}
				if (value.failed) {
					this.reject(value.value);
					return;
				}
				value = value.value;
			}
		} else {
			value = listValue;
		}
		this.processValue(listValue, value);
	},
	processValue: function (listValue, value) {
		if (value) {
			this.resolve(listValue);
			return;
		}
		while (++this.current < this.length) {
			if (this.current in this.list) {
				this.process();
				return;
			}
		}
		this.resolve(undefined);
	}
};

module.exports = function (cb/*, thisArg*/) {
	value(this);
	((cb == null) || callable(cb));

	return new Find(this, cb, arguments[1]);
};
