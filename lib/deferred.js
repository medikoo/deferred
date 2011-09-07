'use strict';

var isError     = require('es5-ext/lib/Error/is-error')
  , isFunction  = require('es5-ext/lib/Function/is-function')
  , noop        = require('es5-ext/lib/Function/noop')
  , curry       = require('es5-ext/lib/Function/curry').call
  , sequence    = require('es5-ext/lib/Function/sequence').call
  , silent      = require('es5-ext/lib/Function/silent').bind
  , bindMethods = require('es5-ext/lib/Object/plain/bind-methods').call
  , nextTick    = require('clock/lib/next-tick')

  , isPromise   = require('./is-promise')

  , deferred, promise, proto, port, then, valueOf, count = 0;

proto = {
	run: function (data) {
		var cb;
		if (data[0] === 'then') {
			cb = this.failed ? data[1][1] : data[1][0];
			nextTick(isFunction(cb) ? sequence(silent(cb, this.value.valueOf()), data[2]) :
				curry(data[2], cb));
		} else {
			(data[2] || noop)(this.value[data[0]].apply(this.value, data[1]));
		}
	},
	resolve: function (value) {
		var rvalue, resolve;
		if (this.value) {
			throw new Error("Promise is already resolved");
		}
		if (isPromise(value)) {
			// resolved with promise
			rvalue = value.valueOf();
			if (rvalue !== value) {
				// resolved with resolved promise
				return this.resolve(rvalue);
			}
			resolve = this._resolve.bind(this);
			(this.promise = this.value = value)
			(resolve, resolve);
		} else {
			this._resolve(value);
		}
		return this.promise;
	},
	_resolve: function (value) {
		var pending = this.pending;
		this.failed = isError(value);
		this.promise = this.value = promise(value);
		delete this.pending;
		clearTimeout(this.timeout);
		delete this.timeout;
		if (this.monitor) {
			clearTimeout(this.monitor);
		}

		pending.forEach(this.run, this);
	}
};

then = function (win, fail) {
	if (!this.value) {
		var d = deferred();
		this.pending.push(['then', [win, fail], d.resolve]);
		return d.promise;
	} else {
		return this.value.then(win, fail);
	}
};

valueOf = function () {
	if (this.value) {
		return this.value.valueOf();
	} else {
		return this.promise;
	}
};

module.exports = deferred = function () {
	process.stdout.write('|' +  ++count + '|');
	var d, p;
	d = Object.create(proto);
	d.pending = [],
	d.timeout = setTimeout(noop, Infinity);

	(p = d.promise = then.bind(d)).then = p;
	bindMethods(p, d, port);
	p.valueOf = valueOf.bind(d);

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
