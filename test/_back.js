'use strict';

var deferred = require('../lib/deferred');

module.exports = {
	"Then": function () {
		var x = {}, y = {}, e = new Error("Error");
		return {
			"Callback": function (a, d) {
				deferred(x)(function (result) {
					a(result, x); d();
				}, a.never).end();
			},
			"Null": function (a, d) {
				deferred(x)(null, a.never)(function (result) {
					a(result, x); d();
				}, a.never).end();
			},
			"Other value": function (a, d) {
				deferred(x)(y, a.never)(function (result) {
					a(result, y); d();
				}, a.never).end();
			},
			"Error": function (a, d) {
				deferred(e)(a.never, function (result) {
					a(result, e); d();
				}).end();
			}
		};
	},
	"End": function () {
		var e = new Error("Error");
		return {
			"Success": function (a, d) {
				deferred(null).end(a.never)(d);
			},
			"Error": function (a, d) {
				deferred(e).end(function (arg) {
					a(arg, e); d();
				});
			}
		};
	}
};
