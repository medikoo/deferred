'use strict';

var noop        = require('es5-ext/lib/Function/noop')
  , once        = require('es5-ext/lib/Function/once').call
  , sequence    = require('es5-ext/lib/Function/sequence').call
  , silent      = require('es5-ext/lib/Function/silent').bind
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call

  , deferred, promise, proto, port, then;

proto = {
	run: function (data) {
		(data[2] || noop)(this.value[data[0]].apply(this.value, data[1]));
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

then = (function (callback) {
	return function (win, fail) {
		var d = deferred();
		this.queue(['then',
			[callback(win, d.resolve), callback(fail, d.resolve)]]);
		return d.promise;
	};
}(function (callback, resolve) {
	return once(callback ? sequence(silent(callback), resolve) : resolve);
}));

module.exports = deferred = function () {
	var d, p;
	d = Object.create(proto);
	d.pending = [],
	d.timeout = setTimeout(noop, Infinity);

	(p = d.promise = then.bind(d)).then = p;
	bindMethods(p, d, port);

	return {
		resolve: d.resolve.bind(d),
		promise: d.promise
	};
};

promise = require('./promise');
port = require('./port').get().deferred;
