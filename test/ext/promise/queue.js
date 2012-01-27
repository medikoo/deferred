'use strict';

module.exports = function (t, a) {
	var count = 0, ps = []
	t([t(1), t(2), 3, 4, 5, 6]).queue(3, function () {
		++count;
		var d = t();
		ps.push(d.resolve);
		return d.promise;
	}).end();
	a(count, 3, "Limit");
	ps.shift()();
	a(count, 4, "Limit");
	while (ps.length) {
		ps.shift()();
	}
	a(count, 6, "All run");
};
