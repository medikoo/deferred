'use strict';

var neverCalled = require('tad/lib/utils/never-called')

  , promise     = require('../../lib/promise');

module.exports = function (t, a, d) {
	t(promise(1), promise(2), promise(3)).then(function (r) {
		a.equal(r.join('|'), '1|2|3'); d();
	}, neverCalled(a)).end();
};
