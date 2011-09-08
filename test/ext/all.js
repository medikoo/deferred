'use strict';

var deferred = require('../../lib/deferred');

module.exports = {
	"Deferred": {
		"": function (a, d) {
			var defer = deferred(), x = 0;
			defer.resolve([1,2,3]).all(function (y) {
				return x += y;
			})
			(function (r) {
				a.deep(r, [1, 3, 6]); d();
			}, d).end();
		},
		"Error": function (a, d) {
			var defer = deferred(), x = 0, e = new Error();
			defer.resolve([1,2,3]).all(function (y) {
				return y == 1 ? e : y;
			})
			(a.never, function (r) {
				a(r, e); d();
			}).end();
		}
	},
	"Promise": {
		"": function (a, d) {
			var x = 0;
			deferred([1,2,3]).all(function (y) {
				return x += y;
			})
			(function (r) {
				a.deep(r, [1, 3, 6]); d();
			}, d).end();
		},
		"Error": function (a, d) {
			var x = 0, e = new Error();
			deferred([1,2,3]).all(function (y) {
				return y == 1 ? e : y;
			})
			(a.never, function (r) {
				a(r, e); d();
			}).end();
		}
	}
};
