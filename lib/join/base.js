// Base logic for join methods

'use strict';

var every      = Array.prototype.every
  , map        = Array.prototype.map
  , reduce     = Array.prototype.reduce
  , slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , isList     = require('es5-ext/lib/Object/is-list')
  , isString   = require('es5-ext/lib/String/is-string')
  , deferred   = require('../deferred')
  , isPromise  = require('../is-promise')
  , s2p        = require('../sync-to-promise').call

  , isIterator;

isIterator = function (obj) {
	return obj && isFunction(obj.next);
};

module.exports = {
	inProgress: 0,
	resolved: false,
	init: function self (args) {
		var iterator, iargs, isl;
		isl = isList(args[0]) && !isString(args[0]);
		if (isl && (args.length === 1)) {
			return self.call(this, args[0]);
		}
		this.values = [];
		this.resolved = [];
		this.deferred = deferred();
		if (isl) {
			args = reduce.call(slice.call(args, 2), function (col, async) {
				return map.call(col, function (x) {
					return deferred(x)(async);
				});
			}, map.call(args[0], args[1]));
		} else if (isIterator(args[0])) {
			iterator = args[0]; iargs = slice.call(args, 1); args = [];
			return s2p(iterator.next.bind(iterator))
			(function self2 (r) {
				if (r) {
					args.push(iargs.reduce(function (r, fn) {
						return deferred(r)(fn);
					}, r));
					return deferred(iterator.next())(self2.bind(this));
				} else {
					this.setup(args);
					return this.deferred.promise;
				}
			}.bind(this));
		}
		this.setup(args);
		return this.deferred.promise;
	},
	setup: function (args) {
		var last;
		if (every.call(args, function (o, i) {
			if (isPromise(o)) {
				++this.inProgress;
				this.hold(i, o);
			} else if (isFunction(o)) {
				if (isPromise(last)) {
					++this.inProgress;
					this.hold(i, o = last.then(o));
				} else {
					o = last ? o(last) : o();
					if (isPromise(o)) {
						++this.inProgress;
						this.hold(i, o);
					} else {
						this.resolveItem(i, o);
					}
				}
			} else {
				this.resolveItem(i, o);
			}
			last = o;
			return !this.resolved.all;
		}, this)) {

			this.initialized = true;
			if (!this.inProgress) {
				this.resolve();
			}
		}
	},
	hold: function (i, promise) {
		var cb = this.resolveItemAsync.bind(this, i);
		promise(cb, cb);
	},
	resolveItemAsync: function (i, r) {
		if (this.resolved.all || this.resolved[i]) {
			return;
		}
		this.resolveItem(i, r);
		if (!--this.inProgress && this.initialized && !this.resolved.all) {
			this.resolve();
		}
	},
	resolveItem: function (i, r) {
		this.resolved[i] = true;
		this.values[i] = r;
	},
	resolve: function () {
		this.resolved.all = true;
		this.deferred.resolve(this.values);
	}
};
