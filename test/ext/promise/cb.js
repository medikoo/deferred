'use strict';

var deferred = require('../../../lib/deferred');

module.exports = {
	"Deferred": {
		"": function (a, d) {
			var defer = deferred(), x = {};
			defer.resolve(x);
			a(defer.promise.cb(function (err, res) {
				a(err, null, "Error object is null");
				a(res, x); d();
			}), undefined, "Does not return anything");
		},
		"Error": function (a, d) {
			var defer = deferred(), x = new Error('Error');
			defer.resolve(x);
			defer.promise.cb(function (err, res) {
				a(err, x);
				a(res, null, "Result is null"); d();
			});
		}
	},
	"Promise": {
		"": function (t, a, d) {
			var x = {};
			a(deferred(x).cb(function (err, res) {
				a(err, null, "Error object is null");
				a(res, x); d();
			}), undefined, "Does not return anything");
		},
		"Error": function (t, a, d) {
			var x = new Error('Error');
			deferred(x).cb(function (err, res) {
				a(err, x);
				a(res, null, "Result is null"); d();
			});
		}
	}
};
