'use strict';

var isFunction  = require('es5-ext/lib/Function/is-function')
  , noop        = require('es5-ext/lib/Function/noop')
  , once        = require('es5-ext/lib/Function/once').call
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call

  , deferred, promise, proto, port, then;

proto = {
	run: function (data) {
		(data[2] || noop)(this.value[data[0]].apply(this.value, data[1]));
	},
	resolve: function (value) {
		if (this.value) {
			throw new Error("Promise is already resolved");
		}

		var pending = this.pending;
		this.value = promise(value);
		delete this.pending;
		clearTimeout(this.timeout);
		delete this.timeout;
		if (this.monitor) {
			clearTimeout(this.monitor);
		}

		pending.forEach(this.run, this);
		return this.promise;
	}
};

then = function (win, fail) {
	if (this.pending) {
		var d = deferred();
		this.pending.push(['then', [isFunction(win) ? once(win) : win,
			isFunction(fail) ? once(fail) : fail], d.resolve]);
		return d.promise;
	} else {
		return this.value.then(win, fail);
	}
};

module.exports = deferred = function () {
	var d, p;
	d = Object.create(proto);
	d.pending = [],
	d.timeout = setTimeout(noop, Infinity);

	(p = d.promise = then.bind(d)).then = p;
	bindMethods(p, d, port);

	if (deferred.MONITOR) {
		d.monitor = deferred.MONITOR();
	}

	return {
		resolve: d.resolve.bind(d),
		promise: d.promise
	};
};

promise = require('./promise');
port = require('./port').get().deferred;
