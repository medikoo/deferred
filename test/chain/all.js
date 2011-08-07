'use strict';

var promise = require('../../lib/promise');

module.exports = {
	"Success": function (t, a, d) {
		t(promise(1), promise(2), promise(3))(function (r) {
			a(r.join('|'), '1|2|3'); d();
		}, a.never).end();
	},
	"Promise fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), promise(e), promise(3))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Function fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), function () {
			return e;
		}, promise(3))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Object fail": function (t, a, d) {
		var e = new Error('Test');
		t(promise(1), e, a.never)(a.never, function (r) {
			a(r, e); d();
		}).end();
	}
};
