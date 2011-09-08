'use strict';

var deferred = require('../../lib/deferred');

module.exports = function (t, a, d) {
	t(deferred(1), deferred(2), deferred(3))(function (r) {
		a(r.join('|'), '1|2|3'); d();
	}, a.never).end();
};
