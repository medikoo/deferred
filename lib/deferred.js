'use strict';

var noop        = require('es5-ext/lib/Function/noop')
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , once        = require('es5-ext/lib/Function/once').call
  , sequence    = require('es5-ext/lib/Function/sequence').call
  , silent      = require('es5-ext/lib/Function/silent').bind
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , merge       = require('es5-ext/lib/Object/plain/merge').call

  , deferred, promise, proto, port;

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

port = {
	then: (function (callback) {
		return function (win, fail) {
			var d = deferred();
			this.queue(['then',
				[callback(win, d.resolve), callback(fail, d.resolve)]]);
			return d.promise;
		};
	}(function (callback, resolve) {
		return once(callback ? sequence(silent(callback), resolve) : resolve);
	})),
	cb: function (cb) {
		this.queue(['cb', [cb]]);
	},
	end: function (handler) {
		this.queue(['end', [handler]]);
		return this.promise;
	}
};
['join', 'all', 'first'].forEach(function (name) {
	port[name] = function () {
		var d = deferred();
		this.queue([name, arguments, d.resolve]);
		return d.promise;
	}
});

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
