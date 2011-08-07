'use strict';

var k = require('es5-ext/lib/Function/k');

module.exports = {
	"": function (t, a, d) {
		var x = {};
		t = t.call;
		t(k(x))(function (r) {
			a(r, x); d();
		}, a.never);
	},
	"Error": function (t, a, d) {
		var e = new Error('Error!');
		t = t.call;
		t(function () {
			throw e;
		})(a.never, function (r) {
			a(r, e); d();
		});
	}
};
