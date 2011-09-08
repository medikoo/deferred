'use strict';

var create           = Object.create
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , push             = require('es5-ext/lib/Array/push/apply')
  , isError          = require('es5-ext/lib/Error/is-error')
  , throwError       = require('es5-ext/lib/Error/throw')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , noop             = require('es5-ext/lib/Function/noop')
  , curry            = require('es5-ext/lib/Function/curry').call
  , sequence         = require('es5-ext/lib/Function/sequence').call
  , silent           = require('es5-ext/lib/Function/silent').bind
  , c                = require('es5-ext/lib/Object/descriptors/c')
  , ce               = require('es5-ext/lib/Object/descriptors/ce')
  , e                = require('es5-ext/lib/Object/descriptors/e')
  , v                = require('es5-ext/lib/Object/descriptors/v')
  , bindMethods      = require('es5-ext/lib/Object/plain/bind-methods').call
  , merge            = require('es5-ext/lib/Object/plain/merge').call
  , nextTick         = require('clock/lib/next-tick')

  , isPromise        = require('./is-promise')
  , base             = require('./base').get()

  , createPromise, resetBase, deferred, createDeferred;

createPromise = (function (then) {
	return function (_base) {
		var o = {}, p;
		p = bindMethods(then.bind(o), o, base.promise);
		p._setBase(_base);
		return p.then = p;
	};
}(function (win, fail) {
	var d = createDeferred();
	this._base.then(win, fail, d.resolve);
	return d.promise;
}));

merge(base.promise, {
	end: function (handler) {
		this._base.end(handler);
		return this.then;
	},
	_getBase: function () {
		return this._base;
	},
	_setBase: function (base) {
		return defineProperty(this, '_base', base);
	}
});

merge(base.resolved, {
	_resolved: true,
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
	_resolve: function (newBase) {
		clearTimeout(this._timeout);
		delete this._timeout;
		if (this._monitor) {
			clearTimeout(this._monitor);
			delete this._monitor;
		}
		this._dependencies.forEach(function (promise) {
			promise._setBase(c(newBase));
		}, this);
		delete this._dependencies;
		if (this._pending) {
			this._pending.forEach(this._run, newBase);
		}
		delete this._pending;
	},
	_run: function (data) {
		this[data[0]].apply(this, data[1]);
	},
	_merge: function (promise) {
		var base = promise._getBase();
		push(this._pending, base._pending);
		delete base._pending;
		base._resolve();
		promise._setBase(c(this));
		this._dependencies.push(promise);
	}
});

deferred = {
	resolved: false,
	resolve: function (value) {
		var newBase, oldBase, reset, pending;
		if (this.resolved) {
			throw new Error("Promise is already resolved");
		}
		defineProperty(this, 'resolved', e(true));
		if (isPromise(value)) {
			// resolved with promise
			oldBase = this.promise._getBase();
			if ((newBase = value._getBase())._resolved) {
				// resolved with resolved promise
				oldBase._resolve(newBase);
				this.promise._setBase(v(newBase));
			} else {
				newBase._merge(this.promise);
			}
			defineProperty(this, 'promise', e(value));
		} else {
			oldBase = this.promise._getBase();
			this.promise._setBase(v(newBase = create(base.resolved, {
				_value: v(value),
				_failed: v(isError(value)),
				_promise: v(this.promise)
			})));
			oldBase._resolve(newBase);
		}
		return this.promise;
	}
};

module.exports = createDeferred = function (value) {
	var o;
	if (arguments.length) {
		if (value && isPromise(value)) {
			return value;
		}
		o = createPromise(v(create(base.resolved, {
			_value: v(value),
			_failed: v(isError(value))
		})));
		defineProperty(o._getBase(), '_promise', v(o));
		return o;
	}

	o = create(deferred, {
		promise: ce(createPromise(c(create(base.unresolved, {
			_pending: c([]),
			_dependencies: c([]),
			_timeout: c(setTimeout(noop, Infinity)),
			_monitor: c(createDeferred.MONITOR && createDeferred.MONITOR())
		}))))
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};
