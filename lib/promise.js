'use strict';

var push             = Array.prototype.push
  , apply            = Function.prototype.apply
  , defineProperty   = Object.defineProperty
  , isError          = require('es5-ext/lib/Error/is-error')
  , noop             = require('es5-ext/lib/Function/noop')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , silent           = require('es5-ext/lib/Function/prototype/silent')
  , assertCallable   = require('es5-ext/lib/Object/assert-callable')
  , dscr             = require('es5-ext/lib/Object/descriptor')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')
  , merge            = require('es5-ext/lib/Object/prototype/merge')
  , isPromise        = require('./is-promise')

  , front, back, resolved, unresolved, deferred;

front = {
	end: function (win, fail) {
		(win != null) && assertCallable(win);
		(fail != null) && assertCallable(fail);
		this._base.next('end', arguments);
	},
	valueOf: function () {
		return this._base.resolved ? this._base.value : this;
	}
};

back = {
	then: function (win, fail, resolve) {
		var cb = this.failed ? fail : win;
		resolve((cb == null) ? this.promise :
			(isCallable(cb) ? silent.call(cb, this.value) : cb));
	},
	end:  function (win, fail) {
		if (win) {
			if (fail) {
				this.failed ? fail(this.value) : win(this.value);
			} else {
				this.failed ? win(this.value) : win(null, this.value);
			}
		} else if (this.failed) {
			throw this.value;
		}
	}
};

resolved = {
	resolved: true,
	link: function (promise) {
		var previous, base;
		base = dscr.v(this);
		previous = promise._base;
		this.promise = promise;
		defineProperty(promise, '_base', base);
		if (previous) {
			clearTimeout(previous.timeout);
			if (previous.monitor) {
				clearTimeout(previous.monitor);
			}
			previous.promises.forEach(function (promise) {
				defineProperty(promise, '_base', base);
			}, this);
			previous.pending.forEach(match.call(this.next), this);
		}
		return promise;
	},
	next: function (name, args) {
		back[name].apply(this, args);
	}
};

unresolved = {
	resolved: false,
	link: function (promise) {
		var previous, base;
		base = dscr.c(this);
		if ((previous = promise._base)) {
			clearTimeout(previous.timeout);
			if (previous.monitor) {
				clearTimeout(previous.monitor);
			}
			previous.promises.forEach(function (promise) {
				defineProperty(promise, '_base', base);
				this.promises.push(promise);
			}, this);
			push.apply(this.pending, previous.pending);
		}
		this.promises.push(promise);
		defineProperty(promise, '_base', base);
		return promise;
	},
	next: function () {
		this.pending.push(arguments);
	},
	resolve: function (value) {
		return (isPromise(value) ? value._base : create.call(resolved, {
			value: value,
			failed: isError(value)
		})).link(this.promises[0]);
	}
};

exports = module.exports = function (value) {
	var promise;

	if (isPromise(value)) {
		return value;
	}

	promise = function (win, fail) {
		var d = deferred();
		promise._base.next('then', [win, fail, d.resolve]);
		return d.promise;
	};
	promise.then = promise;
	merge.call(promise, front);

	(arguments.length ? create.call(resolved, {
		value: value,
		failed: isError(value)
	}) : create.call(unresolved, {
		pending: [],
		promises: [],
		timeout: setTimeout(noop, 1e13),
		monitor: deferred.MONITOR && deferred.MONITOR()
	})).link(promise);

	return promise;
};

exports.front = front;
exports.back = back;

deferred = require('./deferred');
