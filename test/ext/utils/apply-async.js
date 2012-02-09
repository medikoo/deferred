'use strict';

var deferred = require('../../../lib/deferred');

module.exports = {
	"Successful": function (t, a, d) {
		var x = {}, y = {}, z = {}, defer;
		defer = deferred();
		defer.promise(function (result) {
			a(result, z);
		}, a.never).end(d);
		t(function (arg1, arg2, callback) {
			a.deep([arg1, arg2], [x, y], "Arguments");
			setTimeout(function () {
				callback(null, z);
			}, 0);
		}, [x, y], defer.resolve);
	},
	"Successful: Many args": function (t, a, d) {
		var x = {}, y = {}, z = {}, defer;
		defer = deferred();
		defer.promise(function (result) {
			a.deep(result, [x, y, z]);
		}, a.never).end(d);
		t(function (arg1, arg2, callback) {
			a.deep([arg1, arg2], [x, y], "Arguments");
			setTimeout(function () {
				callback(null, x, y, z);
			}, 0);
		}, [x, y], defer.resolve);
	},
	"Erroneous": function (t, a, d) {
		var x = new Error('Test'), defer;
		defer = deferred();
		defer.promise(a.never, function (result) {
			a(result, x);
		}).end(d);
		t(function (callback) {
			setTimeout(function () {
				callback(x);
			}, 0);
		}, [], defer.resolve);
	},
	"Function crash": function (t, a, d) {
		var x = new Error('Test'), defer;
		defer = deferred();
		defer.promise(a.never, function (result) {
			a(result, x);
		}).end(d);
		t(function (callback) {
			throw x;
		}, [], defer.resolve);
	},
	"True/False": function (t, a, d) {
		var defer;
		defer = deferred();
		defer.promise(function (result) {
			a(result, false);
		}, a.never).end(d);
		t(function (callback) {
			setTimeout(function () {
				callback(false);
			}, 0);
		}, [], defer.resolve);
	}
};
