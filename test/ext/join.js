'use strict';

var deferred = require('../../lib/deferred');

module.exports = {
	"Deferred": function (a, d) {
		var defer = deferred(), x = 0, e = new Error();
		defer.resolve([1,2,3]).join(function (y) {
			return y == 1 ? e : y;
		})
		(function (r) {
			a.deep(r, [e, 2, 3]); d();
		}, d).end();
	},
	"Promise": function (a, d) {
		var x = 0, e = new Error();
		deferred([1,2,3]).join(function (y) {
			return y == 1 ? e : y;
		})
		(function (r) {
			a.deep(r, [e, 2, 3]); d();
		}, d).end();
	}
};
