'use strict';

module.exports = function (t, a, d) {
	var x = {}, y = {}, p;
	t(function () {
		return y;
	}, 100)(function (r) {
		x = r;
	}).end();
	a.not(x, y, "Not yet");
	setTimeout(function () {
		a.not(x, y, "After a while");
		setTimeout(function () {
			a(x, y, "It's ready now"); d();
		}, 70);
	}, 50);
};
