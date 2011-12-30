'use strict';

var map              = Array.prototype.map
  , isError          = require('es5-ext/lib/Error/is-error')
  , invoke           = require('es5-ext/lib/Function/invoke')
  , noop             = require('es5-ext/lib/Function/noop')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')
  , merge            = require('es5-ext/lib/Object/prototype/merge')

  , base             = require('./_base').get()
  , isPromise        = require('./is-promise')

  , createPromise, createDeferred, promise, resolved, unresolved, deferred
  , toPromise;

createPromise = function (base, props) {
	var p = function (win, fail) {
		var d = createDeferred();
		p._base._next('then', [win, fail, d.resolve]);
		return d.promise;
	};
	return create.call(base, props)._link(merge.call((p.then = p), promise));
};

promise = base.promise;
resolved = base.resolved;
unresolved = base.unresolved;

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
