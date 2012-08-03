// Promise function implementation. Unresolved and resolved logic.
// When function is called with argument it returns resolved promise of
// which value is that argument, otherwise unresolved promise is returned.

'use strict';

var create          = Object.create
  , defineProperty  = Object.defineProperty
  , isError         = require('es5-ext/lib/Error/is-error')
  , noop            = require('es5-ext/lib/Function/noop')
  , callable        = require('es5-ext/lib/Object/valid-callable')
  , d               = require('es5-ext/lib/Object/descriptor')
  , isCallable      = require('es5-ext/lib/Object/is-callable')
  , ee              = require('event-emitter')
  , isPromise       = require('./is-promise')

  , deferred, createPromise, unresolved, resolved, onresolve
  , protoSupported = Boolean(isPromise.__proto__), extNames;

unresolved = ee(create(Function.prototype, {
	then: d(function (win, fail) {
		var def;
		if (!this.pending) {
			this.pending = [];
		}
		def = deferred();
		this.pending.push('then', [win, fail, def.resolve]);
		return def.promise;
	}),
	end: d(function (win, fail) {
		(win == null) || callable(win);
		(fail == null) || callable(fail);
		if (!this.pending) {
			this.pending = [];
		}
		this.pending.push('end', arguments);
	}),
	resolved: d(false),
	returnsPromise: d(true),
	valueOf: d(function () {
		return this;
	})
}));

onresolve = {
	then: function (win, fail, resolve) {
		var value, cb = this.failed ? fail : win;
		if (cb == null) {
			resolve(this.value);
		} else if (isCallable(cb)) {
			if (isPromise(cb)) {
				if (cb.resolved) {
					resolve(cb.value);
				} else {
					cb.end(resolve, resolve);
				}
			} else {
				try {
					value = cb(this.value);
				} catch (e) {
					value = e;
				}
				resolve(value);
			}
		} else {
			resolve(cb);
		}
	},
	end: function (win, fail) {
		if (this.failed) {
			if (fail) {
				fail(this.value);
			} else {
				throw this.value;
			}
		} else if (win) {
			win(this.value);
		}
	}
};

resolved = ee(create(Function.prototype, {
	then: d(function (win, fail) {
		var value, cb = this.failed ? fail : win;
		if (cb == null) {
			return this;
		} else if (isCallable(cb)) {
			if (isPromise(cb)) {
				return cb;
			}
			try {
				value = cb(this.value);
			} catch (e) {
				value = e;
			}
			return createPromise(value);
		} else {
			return createPromise(cb);
		}
	}),
	end: d(function (win, fail) {
		var cb;
		(win == null) || callable(win);
		(fail == null) || callable(fail);
		if (this.failed) {
			if (fail) {
				fail(this.value);
			} else {
				throw this.value;
			}
		} else if (win) {
			win(this.value);
		}
	}),
	resolved: d(true),
	returnsPromise: d(true),
	valueOf: d(function () {
		return this.value
	})
}));

extNames = ['end', 'then', 'valueOf'];

createPromise = module.exports = function (value) {
	var promise, isResolved = arguments.length;

	if (isResolved && isPromise(value)) {
		return value;
	}

	promise = function (win, fail) {
		return promise.then(win, fail);
	};
	if (isResolved) {
		promise.value = value;
		promise.failed = isError(value);
		promise.__proto__ = resolved;
		createPromise._profile && createPromise._profile(true);
	} else {
		if (!createPromise.unresolvedCount) {
			createPromise.unresolvedTimeout = setTimeout(noop, 1e9);
		}
		++createPromise.unresolvedCount;
		if (createPromise.monitor) {
			promise.monitor = createPromise.monitor();
		}
		promise.__proto__ = unresolved;
		createPromise._profile && createPromise._profile();
	}
	if (!protoSupported) {
		extNames.forEach(function (name) {
			promise[name] = function () {
				return promise.__proto__[name].apply(promise, arguments);
			};
		});
		promise.returnsPromise = true;
		promise.resolved = promise.__proto__.resolved;
	}
	return promise;
};

createPromise.unresolved = unresolved;
createPromise.onresolve = onresolve;
createPromise.resolved = resolved;
createPromise.unresolvedCount = 0;
createPromise.protoSupported = protoSupported;
createPromise.extend = function (name, unres, onres, res) {
	name = String(name);
	callable(res) && ((onres == null) || callable(onres)) && callable(unres);
	defineProperty(unresolved, name, d(unres));
	onresolve[name] = onres;
	defineProperty(resolved, name, d(res));
	extNames.push(name);
};

deferred = require('./deferred');
