'use strict';

var promise = require('../../../../lib/promise');

module.exports = function (t, a, d) {
	t('map', require('../../../../lib/ext/array/map'));

	promise([promise(1), promise(2), 3]).map(function (res) {
		return promise(res * res);
	})(function (r) {
		a.deep(r, [1, 4, 9]);
	}, a.never).end(d);
};
