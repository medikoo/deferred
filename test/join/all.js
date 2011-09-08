'use strict';

var deferred = require('../../lib/deferred');

module.exports = {
	"Success": function (t, a, d) {
		t(deferred(1), deferred(2), deferred(3))(function (r) {
			a(r.join('|'), '1|2|3'); d();
		}, a.never).end();
	},
	"Deferred fail": function (t, a, d) {
		var e = new Error('Test');
		t(deferred(1), deferred(e), deferred(3))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Function fail": function (t, a, d) {
		var e = new Error('Test');
		t(deferred(1), function () {
			return e;
		}, deferred(3))(a.never, function (r) {
			a(r, e); d();
		}).end();
	},
	"Object fail": function (t, a, d) {
		var e = new Error('Test');
		t(deferred(1), e, a.never)(a.never, function (r) {
			a(r, e); d();
		}).end();
	}
};
