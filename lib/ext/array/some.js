// Promise aware Array's some

'use strict';

var call      = Function.prototype.call
  , value     = require('es5-ext/lib/Object/valid-value')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , deferred  = require('../../deferred')
  , isPromise = require('../../is-promise');

var Some = function (list, cb, context) {
	var deferral = deferred();

	this.list = list;
	this.cb = cb;
	this.context = context;
	this.resolve = deferral.resolve;
	this.length = this.list.length >>> 0;

	if (!this.length) {
		return this.resolve(false);
	}

	this.process();
	return deferral.promise;
};

Some.prototype = {
	current: 0,
	process: function () {
		var value = this.list[this.current];
		if (isPromise(value)) {
			if (!value.resolved) {
				value.end(this.processCb.bind(this), this.resolve);
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
				this.resolve(e);
				return;
			}
			if (isPromise(value)) {
				if (!value.resolved) {
					value.end(this.processValue.bind(this), this.resolve);
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
		} else if (++this.current < this.length) {
			this.process();
		} else {
			this.resolve(false);
		}
	}
};

module.exports = function (cb) {
	value(this);
	(cb == null) || callable(cb);

	return new Some(this, cb, arguments[1]);
};
