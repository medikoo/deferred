'use strict';

var deferred = require('../../lib/deferred')
  , promise  = require('../../lib/promise');

module.exports = {
	"Deferred": function (a, d) {
		var defer = deferred(), x = 0;
		defer.resolve([1,2,3]).first(function (y) {
			return y == 1 ? new Error() : y;
		})
		(function (r) {
			a(r, 2); d();
		}, d).end();
	},
	"Promise": function (a, d) {
		var x = 0;
		promise([1,2,3]).first(function (y) {
			return y == 1 ? new Error() : y;
		})
		(function (r) {
			a(r, 2); d();
		}, d).end();
	}
};
