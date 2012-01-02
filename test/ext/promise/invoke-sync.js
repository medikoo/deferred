'use strict';

var deferred = require('../../../lib/deferred');

module.exports = {
	"Deferred": function (a, d) {
		var defer = deferred(), z = {}, x = { bar: z }
		  , y = { foo: function (n) { return x[n]; } }
		  , invoked = false;
		defer.resolve(y).invokeSync('foo', 'bar')
		(function (r) {
			invoked = true;
			a(r, z); d();
		}, d).end();
		a(invoked, false, "Resolve in next tick");
	},
	"Promise": function (a, d) {
		var z = {}, x = { bar: z }
		  , y = { foo: function (n) { return x[n]; } };
		deferred(y).invokeSync('foo', 'bar')
		(function (r) {
			a(r, z); d();
		}, d).end();
	}
};
