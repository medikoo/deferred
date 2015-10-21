'use strict';

var deferred = require('../../../deferred');

module.exports = function (a, d) {
	var invoked = false, checked = false;
	deferred(undefined).delay().done(function () {
		a(checked, true);
		invoked = true;
		d();
	}, d);
	a(invoked, false);
	checked = true;
};
