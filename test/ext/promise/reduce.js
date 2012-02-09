'use strict';

module.exports = function (t, a, d) {
	t([t(2), t(3), 4]).reduce(function (arg1, arg2) {
		return t(arg1 * arg2);
	}, t(1))(function (r) {
		a(r, 24);
	}, a.never).end(d);
};
