'use strict';

var k       = require('es5-ext/lib/Function/k')

  , deferred = require('../../lib/deferred');

module.exports = {
	"Return first to succeed": function (t, a, d) {
		var x = {}
		  , p1 = deferred(x)
		  , p2 = p1.then(k({}))
		  , p3 = p2.then(k({}));
		t(p1, p3, p3)(function (r) {
			a(r, x); d();
		}, a.never).end();
	},
	"Error when all fail": function (t, a, d) {
		var e = new Error('Test');
		t(deferred(e), deferred(e), deferred(e))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Ignore errors when any succeed": function (t, a, d) {
		var e = new Error('Test');
		var x = {};
		t(deferred(e), deferred(e), deferred(x))(function (r) {
			a(r, x); d();
		}, a.never).end();
	}
};
