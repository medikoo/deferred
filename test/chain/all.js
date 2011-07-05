'use strict';

var neverCalled = require('tad/lib/utils/never-called')

  , promise     = require('../../lib/promise');

module.exports = {
	"Success": function (t, a, d) {
		t(promise(1), promise(2), promise(3)).then(function (r) {
			a.equal(r.join('|'), '1|2|3'); d();
		}, neverCalled(a)).end();
	},
	"Promise fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), promise(e), promise(3)).then(neverCalled(a), function (r) {
			a.equal(r, e); d();
		}).end();
	},
	"Function fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), function () {
			return e;
		}, promise(3)).then(neverCalled(a), function (r) {
			a.equal(r, e); d();
		}).end();
	},
	"Object fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), e, neverCalled(a)).then(neverCalled(a), function (r) {
			a.equal(r, e); d();
		}).end();
	}
};
