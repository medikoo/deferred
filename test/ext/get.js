'use strict';

var deferred = require('../../lib/deferred');

module.exports = {
	"Deferred": function (a, d) {
		var defer = deferred(), x = {}, y = { foo: x }
		  , invoked = false;
		defer.resolve(y).get('foo')
		(function (r) {
			invoked = true;
			a(r, x); d();
		}, d).end();
		a(invoked, false, "Resolve in next tick");
	},
	"Promise": function (a, d) {
		var x = {}, y = { foo: x };
		deferred(y).get('foo')
		(function (r) {
			a(r, x); d();
		}, d).end();
	}
};
