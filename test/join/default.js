'use strict';

var promise = require('../../lib/promise');

module.exports = function (t, a, d) {
	t(promise(1), promise(2), promise(3))(function (r) {
		a(r.join('|'), '1|2|3'); d();
	}, a.never).end();
};
