'use strict';

var noop        = require('es5-ext/lib/Function/noop')
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , merge       = require('es5-ext/lib/Object/plain/merge').call

  , deferred, promise, proto, port;

proto = {
	run: function (data) {
		this.value[data[0]].apply(this.value, data[1]);
	},
	queue: function (data) {
		if (this.pending) {
			this.pending.push(data);
		} else {
			this.run(data);
		}
	},
	resolve: function (value) {
		if (this.value) {
			throw new Error("Promise is already resolved");
		}

		var pending = this.pending;
		this.value = promise(value);
		delete this.pending;
		clearTimeout(this.timeout);

		pending.forEach(this.run, this);
		return this.promise;
	}
};

port = {
	then: (function (callback) {
		return function (win, fail) {
			var d = deferred();
			this.queue(['then', [callback.bind(d, win), callback.bind(d, fail)]]);
			return d.promise;
		};
	}(function (callback, value) {
		if (this.done) {
			return;
		}
		this.done = true;
		if (callback) {
			try {
				value = callback(value);
			} catch (e) {
				value = e;
			}
		}
		this.resolve(value);
	})),
	cb: function (cb) {
		this.queue(['cb', [cb]]);
	},
	end: function (handler) {
		this.queue(['end', [handler]]);
		// return this.promise;
	}
};

module.exports = deferred = function () {
	var d, p;
	d = Object.create(proto);
	d.pending = [],
	d.timeout = setTimeout(noop, Infinity);

	p = bindMethods({}, d, port);
	d.promise = merge(p.then, p);
	d.promise.callback = p.cb;

	return {
		resolve: d.resolve.bind(d),
		promise: d.promise
	};
};

promise = require('./promise');
