'use strict';

var k       = require('es5-ext/lib/Function/k')

  , promise = require('../../lib/promise');

module.exports = {
	"Return first to succeed": function (t, a, d) {
		var x = {}
		  , p1 = promise(x)
		  , p2 = p1.then(k({}))
		  , p3 = p2.then(k({}));
		t(p1, p3, p3)(function (r) {
			a(r, x); d();
		}, a.never).end();
	},
	"Error when all fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(e), promise(e), promise(e))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Ignore errors when any succeed": function (t, a, d) {
		var e = new Error('Test');
		var x = {};
		t(promise(e), promise(e), promise(x))(function (r) {
			a(r, x); d();
		}, a.never).end();
	}
};
