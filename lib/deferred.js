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
		p._base.next('then', [win, fail, d.resolve]);
		return d.promise;
	};
	return create.call(base, props).link(merge.call((p.then = p), front));
};

resolved = {
	resolved: true,
	link: function (promise) {
		var unresolved, dscr;
		dscr = dcr.v(this);
		unresolved = promise._base;
		this._promise = promise;
		defineProperty(promise, '_base', dscr);
		if (unresolved) {
			clearTimeout(unresolved.timeout);
			if (unresolved.monitor) {
				clearTimeout(unresolved.monitor);
			}
			unresolved.promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
			}, this);
			unresolved.pending.forEach(match.call(this.next), this);
		}
		return promise;
	},
	next: function (name, args) {
		nextTick(apply.bind(back[name], this, args));
	}
};

unresolved = {
	resolved: false,
	link: function (promise) {
		var previous, dscr;
		dscr = dcr.c(this);
		if ((previous = promise._base)) {
			clearTimeout(previous.timeout);
			if (previous.monitor) {
				clearTimeout(previous.monitor);
			}
			previous.promises.forEach(function (promise) {
				defineProperty(promise, '_base', dscr);
				this.promises.push(promise);
			}, this);
			push.apply(this.pending, previous.pending);
		}
		this.promises.push(promise);
		defineProperty(promise, '_base', dscr);
		return promise;
	},
	next: function () {
		this.pending.push(arguments);
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
			value: value,
			failed: isError(value)
		})).link(this.promise);
	}
};

toPromise = function (value) {
	return isPromise(value) ? value : createPromise(resolved, {
		value: value,
		failed: isError(value)
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
			pending: [],
			promises: [],
			timeout: setTimeout(noop, 1e13),
			monitor: createDeferred.MONITOR && createDeferred.MONITOR()
		})
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};
