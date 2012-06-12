'use strict';

module.exports = function (t, a) {
	var fn = function () {}, fn2;
	fn2 = t(fn);
	a(fn, fn2, "Return");
	a(fn.returnsPromise, true);
};
