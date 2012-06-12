'use strict';

module.exports = function (t, a, d) {
	var count = 0;
	t([t(1), t(2), 3]).some(function (res) {
		++count;
		if (res > 1) {
			return true;
		}
	})(function (r) {
		a(r, true);
		a(count, 2, "Count");
	}).end(d);
};
