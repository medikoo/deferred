'use strict';

var deferred = require('../../lib/deferred')
  , promise  = require('../../lib/promise');

module.exports = {
	"Deferred": function (a, d) {
		var x = {}, fn;
		fn = function (y, cb) {
			setTimeout(function () {
				cb(null, y);
			}, 10);
		};
		deferred().resolve({ foo: fn }).invokeAsync('foo', x)
		(function (r) {
			a(r, x); d();
		}, d).end();
	},
	"Promise": function (a, d) {
		var x = {}, fn;
		fn = function (y, cb) {
			setTimeout(function () {
				cb(null, y);
			}, 10);
		};
		promise({ foo: fn }).invokeAsync('foo', x)
		(function (r) {
			a(r, x); d();
		}, d).end();
	}
};
