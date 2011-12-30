'use strict';

var map              = Array.prototype.map
  , push             = Array.prototype.push
  , apply            = Function.prototype.apply
  , defineProperty   = Object.defineProperty
  , isError          = require('es5-ext/lib/Error/is-error')
  , invoke           = require('es5-ext/lib/Function/invoke')
  , noop             = require('es5-ext/lib/Function/noop')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , dcr              = require('es5-ext/lib/Object/descriptor')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')
  , merge            = require('es5-ext/lib/Object/prototype/merge')
  , nextTick         = require('clock/lib/next-tick')
  , front            = require('./_front')
  , back             = require('./_back')
  , isPromise        = require('./is-promise')

  , createPromise, createDeferred, resolved, unresolved, deferred
  , toPromise;

createPromise = function (base, props) {
	var p = function (win, fail) {
		var d = createDeferred();
		p._base._next('then', [win, fail, d.resolve]);
		return d.promise;
	};
	return create.call(base, props)._link(merge.call((p.then = p), front));
};

resolved = {
	_resolved: true,
	_link: function (promise) {
		var unresolved, dscr;
		dscr = dcr.v(this);
		unresolved = promise._base;
		this._promise = promise;
		defineProperty(promise, '_base', dscr);
		if (unresolved) {
			clearTimeout(unresolved._timeout);
			if (unresolved._monitor) {
				clearTimeout(unresolved._monitor);
			}
			unresolved._promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
			}, this);
			unresolved._pending.forEach(match.call(this._next), this);
		}
		return promise;
	},
	_next: function (name, args) {
		nextTick(apply.bind(back[name], this, args));
	}
};

unresolved = {
	_resolved: false,
	_link: function (promise) {
		var previous, dscr;
		dscr = dcr.c(this);
		if ((previous = promise._base)) {
			clearTimeout(previous._timeout);
			if (previous._monitor) {
				clearTimeout(previous._monitor);
			}
			previous._promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
				this._promises.push(promise);
			}, this);
			push.apply(this._pending, previous._pending);
		}
		this._promises.push(promise);
		defineProperty(promise, '_base', dscr);
		return promise;
	},
	_next: function () {
		this._pending.push(arguments);
	}
};

deferred = {
	resolved: false,
	resolve: function (value) {
		if (this.resolved) {
			return this.promise;
		}
		this.resolved = true;
		return (isPromise(value) ? value._base : create.call(resolved, {
			_value: value,
			_failed: isError(value)
		}))._link(this.promise);
	}
};

toPromise = function (value) {
	return isPromise(value) ? value : createPromise(resolved, {
		_value: value,
		_failed: isError(value)
	});
};

module.exports = createDeferred = function (value) {
	var o, l, args, d;
	if ((l = arguments.length)) {
		if (l > 1) {
			d = createDeferred();
			args = map.call(arguments, toPromise);
			args.forEach(function (arg) {
				arg(noop, d.resolve);
			});
			args.reduce(function (a, b) {
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
