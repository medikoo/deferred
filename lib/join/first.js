// Resolved when first succeeds or all fail
// Succeeds if any succeeds
// Functions are never called unless it's first argument
// Value is value of succeeded argument or last occurred error

'use strict';

var extend = require('es5-ext/lib/Object/prototype/plain-extend')

  , base;

module.exports = function () {
	return Object.create(base).init(arguments);
};

base = extend.call(require('./base'), {
	resolveItem: function (i, r) {
		if (r instanceof Error) {
			this.lastError = r;
		} else {
			this.resolved.all = true;
			this.deferred.resolve(r);
		}
	},
	resolve: function () {
		this.resolved.all = true;
		this.deferred.resolve(this.lastError);
	}
});
