'use strict';

var k           = require('es5-ext/lib/Function/k')
  , neverCalled = require('tad/lib/utils/never-called')

  , promise     = require('../../lib/promise');

module.exports = {
	"Return first to succeed": function (t, a, d) {
		var x = {}
		  , p1 = promise(x)
		  , p2 = p1.then(k(2))
		  , p3 = p2.then(k(3));
		t(p1, p3, p3).then(function (r) {
			a.equal(r, x); d();
		}, neverCalled(a)).end();
	},
	"Error when all fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(e), promise(e), promise(e)).then(neverCalled(a, "DDD"), function (r) {
			a.equal(r, e); d();
		}).end();
	},
	"Ignore errors when any succeed": function (t, a, d) {
		var e = new Error('Test');
		var x = {};
		t(promise(e), promise(e), promise(x)).then(function (r) {
			a.equal(r, x); d();
		}, neverCalled(a)).end();
	}
};
