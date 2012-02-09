'use strict';

module.exports = function (t, a, d) {
	t([t(1), t(2), 3]).map(function (res) {
		return t(res * res);
	})(function (r) {
		a.deep(r, [1, 4, 9]);
	}, a.never).end(d);
};
