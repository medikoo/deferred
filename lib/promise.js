'use strict';

var push             = Array.prototype.push
  , apply            = Function.prototype.apply
  , defineProperty   = Object.defineProperty
  , keys             = Object.keys
  , isError          = require('es5-ext/lib/Error/is-error')
  , noop             = require('es5-ext/lib/Function/noop')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , silent           = require('es5-ext/lib/Function/prototype/silent')
  , assertCallable   = require('es5-ext/lib/Object/assert-callable')
  , dscr             = require('es5-ext/lib/Object/descriptor')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , isPromise        = require('./is-promise')

  , front, back, Resolved, Unresolved, deferred, createPromise;

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
		return resolve((cb == null) ? this.promise :
				(isCallable(cb) ? silent.call(cb, this.value) : cb));
	},
	end:  function (win, fail) {
		if (this.failed) {
			if (fail) {
				fail(this.value);
			} else if (!win || (arguments.length > 1)) {
				throw this.value;
			} else {
				win(this.value);
			}
		} else if (win) {
			if (arguments.length > 1) {
				win(this.value);
			} else {
				win(null, this.value);
			}
		}
	}
};

Resolved = function (value) {
	this.value = value;
	this.failed = isError(value);
};
Resolved.prototype = {
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

Unresolved = function () {
	this.pending = [];
	this.promises = [];
	this.timeout = setTimeout(noop, 1e13);
	this.monitor = deferred.MONITOR && deferred.MONITOR();
};
Unresolved.prototype = {
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
		return (isPromise(value) ? value._base :
				new Resolved(value)).link(this.promises[0]);
	}
};

createPromise = module.exports = function (value) {
	var promise;

	if (isPromise(value)) {
		return value;
	}

	promise = function (win, fail) {
		var d;
		if (promise._base.resolved) {
			return back.then.call(promise._base, win, fail, createPromise);
		} else {
			d = deferred();
			promise._base.next('then', [win, fail, d.resolve]);
			return d.promise;
		}
	};
	promise.then = promise;
	keys(front).forEach(function (key) {
		promise[key] = front[key];
	});

	((arguments.length) ? new Resolved(value) : new Unresolved()).link(promise);
	return promise;
};

createPromise.front = front;
createPromise.back = back;

deferred = require('./deferred');
