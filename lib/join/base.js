// Base logic for join methods

'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , isListObject = require('es5-ext/lib/List/is-list-object')
  , every      = require('es5-ext/lib/List/every').call
  , map        = require('es5-ext/lib/List/map').call

  , deferred   = require('../deferred')
  , isPromise  = require('../is-promise');

module.exports = {
	inProgress: 0,
	resolved: false,
	init: function (args) {
		var l = args.length;
		if (l < 3) {
			if (isListObject(args[0])) {
				if (l === 1) {
					args = args[0];
				} else if ((l === 2) && isFunction(args[1])) {
					args = map(args[0], args[1]);
				}
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
