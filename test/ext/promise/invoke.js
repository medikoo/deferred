'use strict';

module.exports = function (t) {
	var x = {};
	return {
		"Async": function (a, d) {
			t({}).invoke(function (y, cb) {
				setTimeout(function () {
					cb(null, y);
				}, 0);
			}, x)(function (r) {
				a(r, x);
			}).end(d);
		},
		"Sync": function (a, d) {
			t({}).invoke(function (y, cb) {
				return y;
			}, x)(function (r) {
				a(r, x);
			}).end(d);
		}
	};
};
