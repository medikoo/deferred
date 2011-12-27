'use strict';

var map              = Array.prototype.map
  , push             = Array.prototype.push
  , defineProperty   = Object.defineProperty
  , isError          = require('es5-ext/lib/Error/is-error')
  , throwError       = require('es5-ext/lib/Error/prototype/throw')
  , i                = require('es5-ext/lib/Function/i')
  , invoke           = require('es5-ext/lib/Function/invoke')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , noop             = require('es5-ext/lib/Function/noop')
  , curry            = require('es5-ext/lib/Function/prototype/curry')
  , chain            = require('es5-ext/lib/Function/prototype/chain')
  , silent           = require('es5-ext/lib/Function/prototype/silent')
  , dcr              = require('es5-ext/lib/Object/descriptor')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')
  , merge            = require('es5-ext/lib/Object/prototype/merge')
  , nextTick         = require('clock/lib/next-tick')

  , isPromise        = require('./is-promise')
  , base             = require('./base').get()

  , createPromise, createDeferred, promise, resolved, unresolved, deferred
  , toPromise;

createPromise = function (base, props) {
	var p = function (win, fail) {
		var d = createDeferred();
		p._base.then(win, fail, d.resolve);
		return d.promise;
	};
	return create.call(base, props)._link(merge.call((p.then = p), promise));
};

promise = merge.call(base.promise, {
	end: function (handler) {
		this._base.end(handler);
		return this;
	},
	valueOf: function () {
		return this._base._resolved ? this._base._value : this;
	}
});

resolved = merge.call(base.resolved, {
	then: function (win, fail, resolve) {
		var cb = this._failed ? fail : win;
		nextTick(isFunction(cb) ?
			chain.call(silent.bind(cb, this._value), resolve) :
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
		dscr = dcr.v(this);
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

unresolved = merge.call(base.unresolved, {
	then: function (win, fail, resolve) {
		this._pending.push(['then', arguments]);
	},
	end: function (handler) {
		this._pending.push(['end', arguments]);
	},
	_resolved: false,
	_link: function (promise) {
		var old, dscr;
		dscr = dcr.c(this);
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
			return this.promise;
		}
		this.resolved = true;
		if (isPromise(value)) {
			newBase = value._base;
		} else {
			newBase = create.call(resolved, {
				_value: value,
				_failed: isError(value)
			});
		}
		return newBase._link(this.promise);
	}
};

toPromise = function (value) {
	if (value && isPromise(value)) {
		return value;
	}
	return createPromise(resolved, {
		_value: value,
		_failed: isError(value)
	});
};

module.exports = createDeferred = function (value) {
	var o, l, args, d;
	if ((l = arguments.length)) {
		if (l > 1) {
			d = createDeferred();
			(args = map.call(arguments, function (arg) {
				return toPromise(arg)(i, d.resolve);
			})).reduce(function (a, b) {
				return a(b);
			})
			(function () {
				d.resolve(args.map(invoke('valueOf')));
			}, noop).end();
			return d.promise;
		} else {
			return toPromise(value);
		}
	}

	o = create.call(deferred, {
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
