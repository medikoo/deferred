'use strict';

module.exports = function (t, a, d) {
	var x = {}, fn;
	fn = function (y, cb) {
		setTimeout(function () {
			if (cb) {
				cb(null, 3);
			}
		}, 0);
		return y;
	};
	t({}).invokeSync(fn, x)(function (r) {
		a(r, x);
	}).end(d);
};
