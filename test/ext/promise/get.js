'use strict';

var deferred = require('../../../lib/deferred');

module.exports = {
	"Deferred": function (a) {
		var defer = deferred(), x = {}, y = { foo: x }
		  , invoked = false;
		defer.resolve(y).get('foo')(function (r) {
			invoked = true;
			a(r, x);
		}).end();
		a(invoked, true, "Resolved in current tick");
	},
	"Promise": function (a, d) {
		var x = {}, y = { foo: x };
		deferred(y).get('foo')(function (r) {
			a(r, x);
		}).end(d);
	}
};
