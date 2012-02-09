'use strict';

module.exports = function (t, a, d) {
	var x = {}, fn;
	fn = function (y, cb) {
		setTimeout(function () {
			cb(null, y);
		}, 0);
		return 3;
	};
	t({}).invokeAsync(fn, x)(function (r) {
		a(r, x);
	}).end(d);
};
