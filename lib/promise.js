// Promise function implementation. Unresolved and resolved logic.
// When function is called with argument it returns resolved promise of
// which value is that argument, otherwise unresolved promise is returned.

'use strict';

var create              = Object.create
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , isError             = require('es5-ext/lib/Error/is-error')
  , noop                = require('es5-ext/lib/Function/noop')
  , callable            = require('es5-ext/lib/Object/valid-callable')
  , d                   = require('es5-ext/lib/Object/descriptor')
  , isCallable          = require('es5-ext/lib/Object/is-callable')
  , ee                  = require('event-emitter')
  , isPromise           = require('./is-promise')

  , deferred, createPromise, unresolved, resolved, onswitch
  , protoSupported = Boolean(isPromise.__proto__);

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

onswitch = {
	then: function (win, fail, resolve) {
		var value, cb = this.failed ? fail : win;
		if (cb == null) {
			resolve(this.value);
		} else if (isCallable(cb)) {
			try {
				value = cb(this.value);
			} catch (e) {
				value = e;
			}
			resolve(value);
		} else {
			resolve(cb);
		}
	},
	end: function (win, fail) {
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

resolved = ee(create(Function.prototype, {
	then: d(function (win, fail) {
		var value, cb = this.failed ? fail : win;
		if (cb == null) {
			return this;
		} else if (isCallable(cb)) {
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
		(win == null) || callable(win);
		(fail == null) || callable(fail);
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
	}),
	resolved: d(true),
	returnsPromise: d(true),
	valueOf: d(function () {
		return this.value
	})
}));

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
		if (protoSupported) {
			promise.__proto__ = resolved;
		} else {
			getOwnPropertyNames(resolved).forEach(function (name) {
				promise[name] = resolved[name];
			});
		}
	} else {
		if (!createPromise.unresolvedCount) {
			createPromise.unresolvedTimeout = setTimeout(noop, 1e9);
		}
		++createPromise.unresolvedCount;
		if (createPromise.monitor) {
			promise.monitor = createPromise.monitor();
		}
		if (protoSupported) {
			promise.__proto__ = unresolved;
		} else {
			getOwnPropertyNames(unresolved).forEach(function (name) {
				promise[name] = unresolved[name];
			});
		}
	}
	return promise;
};

createPromise.unresolved = unresolved;
createPromise.onswitch = onswitch;
createPromise.resolved = resolved;
createPromise.unresolvedCount = 0;
createPromise.protoSupported = protoSupported;

deferred = require('./deferred');
