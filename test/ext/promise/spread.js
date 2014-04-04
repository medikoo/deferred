'use strict';

var deferred = require('../../../deferred');

module.exports = {
	"Deferred": function (a) {
		var defer = deferred(), w = {}, x = {}, y = {}, z = [x, y, w]
		  , invoked = false;
		defer.resolve(z).spread(function (m, n, o) {
			invoked = true;
			a(m, x, "#1");
			a(n, y, "#2");
			a(o, w, "#3");
		}).done();
		a(invoked, true, "Resolve in current tick");
	},
	"Promise": function (a, d) {
		var w = {}, x = {}, y = {}, z = [x, y, w];
		deferred(z).spread(function (m, n, o) {
			a(m, x, "#1");
			a(n, y, "#2");
			a(o, w, "#3");
		}).done(d, d);
	},
	"Error": function (a, d) {
		var e = new Error('E!');
		deferred(e).spread(a.never, function (err) {
			a(err, e);
		}).done(d, d);
	}
};
