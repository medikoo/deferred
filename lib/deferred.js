'use strict';

var defineProperty   = Object.defineProperty
  , push             = require('es5-ext/lib/Array/push/apply')
  , isError          = require('es5-ext/lib/Error/is-error')
  , throwError       = require('es5-ext/lib/Error/throw')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , noop             = require('es5-ext/lib/Function/noop')
  , curry            = require('es5-ext/lib/Function/curry').call
  , sequence         = require('es5-ext/lib/Function/sequence').call
  , silent           = require('es5-ext/lib/Function/silent').bind
  , c                = require('es5-ext/lib/Object/descriptors/c')
  , v                = require('es5-ext/lib/Object/descriptors/v')
  , bindMethods      = require('es5-ext/lib/Object/plain/bind-methods').call
  , create           = require('es5-ext/lib/Object/plain/create')
  , merge            = require('es5-ext/lib/Object/plain/merge').call
  , nextTick         = require('clock/lib/next-tick')

  , isPromise        = require('./is-promise')
  , base             = require('./base').get()

  , createPromise, resetBase, deferred, createDeferred;

createPromise = function (_base) {
	var promise = function (win, fail) {
		var d = createDeferred();
		promise._base.then(win, fail, d.resolve);
		return d.promise;
	};
	bindMethods(promise, null, base.promise);
	_base._link(promise);
	return promise.then = promise;
};

merge(base.promise, {
	end: function (handler) {
		this._base.end(handler);
		return this;
	}
});

merge(base.resolved, {
	then: function (win, fail, resolve) {
		var cb = this._failed ? fail : win;
		nextTick(isFunction(cb) ? sequence(silent(cb, this._value), resolve) :
			curry(resolve, (cb == null) ? this._value : cb));
	},
	end: function (handler) {
		if (this._failed) {
			nextTick(
				isFunction(handler) ? curry(handler, this._value) :
					throwError.bind(this._value));
		}
	},
	_resolved: true,
	_link: function (promise) {
		var old, dscr;
		dscr = v(this);
		if ((old = promise._base)) {
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
		defineProperty(promise, '_base', dscr);
		return promise;
	}
});

merge(base.unresolved, {
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
			push(this._pending, old._pending);
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
			newBase = create(base.resolved, {
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
		return createPromise(create(base.resolved, {
			_value: value,
			_failed: isError(value)
		}));
	}

	o = create(deferred, {
		promise: createPromise(create(base.unresolved, {
			_pending: [],
			_promises: [],
			_timeout: setTimeout(noop, Infinity),
			_monitor: createDeferred.MONITOR && createDeferred.MONITOR()
		}))
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};
