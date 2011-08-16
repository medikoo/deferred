'use strict';

var noop       = require('es5-ext/lib/Function/noop')
  , isFunction = require('es5-ext/lib/Function/is-function')

  , deferred, promise, callback, pass, then, cb, resolve, end;

callback = function (callback, value) {
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
};

pass = function (cb) {
	if (isFunction(cb)) {
		this.cb(cb);
	} else {
		this.then.apply(this, cb);
	}
};

then = function (win, fail) {
	var d = deferred()
	  , callbacks = [callback.bind(d, win), callback.bind(d, fail)];

	if (this.pending) {
		this.pending.push(callbacks);
	} else {
		pass.call(this.value, callbacks);
	}
	return d.promise;
};

cb = function (cb) {
	if (this.pending) {
		this.pending.push(cb);
	} else {
		pass.call(this.value, cb);
	}
};

resolve = function (value) {
	if (this.value) {
		throw new Error("Promise is already resolved");
	}

	var pending = this.pending;
	this.value = promise(value);
	delete this.pending;
	clearTimeout(this.timeout);

	pending.forEach(pass.bind(this.value));
	if (this.end) {
		this.value.end(this.end);
	}
	return this.promise;
};

end = function (handler) {
	if (this.pending) {
		this.end = handler || true;
	} else {
		this.value.end(handler);
	}
};

module.exports = deferred = function () {
	var o = {
		pending: [],
		timeout: setTimeout(noop, Infinity)
	};

	(o.promise = then.bind(o)).then = o.promise;
	o.promise.end = end.bind(o);
	o.promise.cb = cb.bind(o);

	return {
		resolve: resolve.bind(o),
		promise: o.promise
	};
};

promise = require('./promise');
