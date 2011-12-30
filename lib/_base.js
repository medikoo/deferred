// Default ports for deferred

'use strict';

var push             = Array.prototype.push
  , apply            = Function.prototype.apply
  , defineProperty   = Object.defineProperty
  , isError          = require('es5-ext/lib/Error/is-error')
  , match            = require('es5-ext/lib/Function/prototype/match')
  , silent           = require('es5-ext/lib/Function/prototype/silent')
  , dcr              = require('es5-ext/lib/Object/descriptor')
  , isCallable       = require('es5-ext/lib/Object/is-callable')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')
  , nextTick         = require('clock/lib/next-tick')

  , base;

base = {
	promise: {
		end: function (handler) {
			this._base._next('end', arguments);
			return this;
		},
		valueOf: function () {
			return this._base._resolved ? this._base._value : this;
		}
	},
	resolved: {
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
			nextTick(apply.bind(this[name], this, args));
		},
		then: function (win, fail, resolve, id) {
			var cb = this._failed ? fail : win;
			resolve((cb == null) ? this._promise :
				(isCallable(cb) ? silent.call(cb, this._value) : cb));
		},
		end: function (handler) {
			if (this._failed) {
				if (isCallable(handler)) {
					handler(this._value);
				} else {
					throw this._value;
				}
			}
		}
	},
	unresolved: {
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
	}
};

exports.get = function () {
	return base;
};

exports.add = function (name, promise, resolved) {
	base.promise[name] = promise;
	base.resolved[name] = resolved;
};
