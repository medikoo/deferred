'use strict';

var push             = Array.prototype.push
  , defineProperty   = Object.defineProperty
  , isError          = require('es5-ext/lib/Error/is-error')
  , throwError       = require('es5-ext/lib/Error/prototype/throw')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , noop             = require('es5-ext/lib/Function/noop')
  , curry            = require('es5-ext/lib/Function/prototype/curry')
  , chain            = require('es5-ext/lib/Function/prototype/chain')
  , silent           = require('es5-ext/lib/Function/silent').bind
  , c                = require('es5-ext/lib/Object/descriptors/c')
  , v                = require('es5-ext/lib/Object/descriptors/v')
  , create           = require('es5-ext/lib/Object/plain/create')
  , merge            = require('es5-ext/lib/Object/plain/merge').call
  , nextTick         = require('clock/lib/next-tick')

  , isPromise        = require('./is-promise')
  , base             = require('./base').get()

  , createPromise, createDeferred, promise, resolved, unresolved, deferred;

createPromise = function (base, props) {
	var p = function (win, fail) {
		var d = createDeferred();
		p._base.then(win, fail, d.resolve);
		return d.promise;
	};
	return create(base, props)._link(merge((p.then = p), promise));
};

promise = merge(base.promise, {
	end: function (handler) {
		this._base.end(handler);
		return this;
	},
	valueOf: function () {
		return this._base._resolved ? this._base._value : this;
	}
});

resolved = merge(base.resolved, {
	then: function (win, fail, resolve) {
		var cb = this._failed ? fail : win;
		nextTick(isFunction(cb) ? chain.call(silent(cb, this._value), resolve) :
			curry.call(resolve, (cb == null) ? this._promise : cb));
	},
	end: function (handler) {
		if (this._failed) {
			nextTick(
				isFunction(handler) ? curry.call(handler, this._value) :
					throwError.bind(this._value));
		}
	},
	_resolved: true,
	_link: function (promise) {
		var old, dscr;
		dscr = v(this);
		old = promise._base;
		this._promise = promise;
		defineProperty(promise, '_base', dscr);
		if (old) {
			clearTimeout(old._timeout);
			if (old._monitor) {
				clearTimeout(old._monitor);
			}
			old._promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
			}, this);
			old._pending.forEach(function (data) {
				this[data[0]].apply(this, data[1]);
			}, this);
			delete old._pending;
			delete old._promises;
		}
		return promise;
	}
});

unresolved = merge(base.unresolved, {
	then: function (win, fail, resolve) {
		this._pending.push(['then', arguments]);
	},
	end: function (handler) {
		this._pending.push(['end', arguments]);
	},
	_resolved: false,
	_link: function (promise) {
		var old, dscr;
		dscr = c(this);
		if ((old = promise._base)) {
			clearTimeout(old._timeout);
			if (old._monitor) {
				clearTimeout(old._monitor);
			}
			old._promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
				this._promises.push(promise);
			}, this);
			push.apply(this._pending, old._pending);
			delete old._pending;
			delete old._promises;
		}
		this._promises.push(promise);
		defineProperty(promise, '_base', dscr);
		return promise;
	}
});

deferred = {
	resolved: false,
	resolve: function (value) {
		var newBase, oldBase, reset, pending;
		if (this.resolved) {
			throw new Error("Promise is already resolved");
		}
		this.resolved = true;
		if (isPromise(value)) {
			newBase = value._base;
		} else {
			newBase = create(resolved, {
				_value: value,
				_failed: isError(value)
			});
		}
		return newBase._link(this.promise);
	}
};

module.exports = createDeferred = function (value) {
	var o;
	if (arguments.length) {
		if (value && isPromise(value)) {
			return value;
		}
		return createPromise(resolved, {
			_value: value,
			_failed: isError(value)
		});
	}

	o = create(deferred, {
		promise: createPromise(unresolved, {
			_pending: [],
			_promises: [],
			_timeout: setTimeout(noop, 1e13),
			_monitor: createDeferred.MONITOR && createDeferred.MONITOR()
		})
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};
