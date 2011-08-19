// Base logic for join methods

'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , isListObject = require('es5-ext/lib/List/is-list-object')
  , every      = require('es5-ext/lib/List/every').call
  , map        = require('es5-ext/lib/List/map').call
  , slice      = require('es5-ext/lib/List/slice').call
  , reduce     = require('es5-ext/lib/List/reduce').call

  , deferred   = require('../deferred')
  , promise    = require('../promise')
  , isPromise  = require('../is-promise');

module.exports = {
	inProgress: 0,
	resolved: false,
	init: function (args) {
		if (isListObject(args[0])) {
			if (args.length === 1) {
				args = args[0];
			} else {
				args = reduce(slice(args, 2), function (col, async) {
					return map(col, function (x) {
						return promise(x)(async);
					});
				}, map(args[0], args[1]));
			}
		}
		this.values = [];
		this.resolved = [];
		this.deferred = deferred();
		this.setup(args);
		return this.deferred.promise;
	},
	setup: function (args) {
		var last;
		if (every(args, function (o, i) {
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
		promise.then(cb, cb);
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
