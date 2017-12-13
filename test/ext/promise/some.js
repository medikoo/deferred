"use strict";

var deferred = require("../../../deferred");

module.exports = function (t, a, d) {
	var count = 0;
	deferred([deferred(1), deferred(2), 3])
		.some(function (res) {
			++count;
			return res > 1;
		})(function (r) {
			a(r, true);
			a(count, 2, "Count");
		})
		.done(d, d);
};
