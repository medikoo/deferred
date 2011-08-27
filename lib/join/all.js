// Resolved when all resolved
// Always succeeds
// Function will be called only if preceding argument succeed
// Function will be called with resolved value of preceding argument
// Value is values of all promises

'use strict';

var extend = require('es5-ext/lib/Object/plain/extend').call

  , base;

module.exports = function () {
	return Object.create(base).init(arguments);
};

base = extend(require('./base'), {
	resolveItem: function (_super, i, r) {
		if (r instanceof Error) {
			this.resolved.all = true;
			this.deferred.resolve(r);
		} else {
			_super(this, i, r);
		}
	}
});
