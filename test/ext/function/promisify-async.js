'use strict';

module.exports = function (t, a) {
	var x = {}, y = {}, z = {};
	t.call(function (arg1, arg2, callback) {
		a.deep([arg1, arg2], [x, y], "Arguments");
		setTimeout(function () {
			callback(null, z);
		}, 0);
	}, x, y)(function (result) {
		a(result, z); d();
	}, a.never);
};
