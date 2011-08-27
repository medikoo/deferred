'use strict';

var deferred = require('../../lib/deferred')
  , promise  = require('../../lib/promise');

module.exports = {
	"Deferred": function (a, d) {
		var defer = deferred(), z = {}, x = { bar: z }
		  , y = { foo: function (n) { return x[n]; } };
		defer.resolve(y).invoke('foo', 'bar')
		(function (r) {
			a(r, z); d();
		}, d).end();
	},
	"Promise": function (a, d) {
		var z = {}, x = { bar: z }
		  , y = { foo: function (n) { return x[n]; } };
		promise(y).invoke('foo', 'bar')
		(function (r) {
			a(r, z); d();
		}, d).end();
	}
};
