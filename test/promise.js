'use strict';

var neverCalled = require('tad/lib/utils/never-called');

module.exports = {
	"Object promise resolves to same object": function (t, a, d) {
		var x = {};
		t(x).then(function (result) {
			a.equal(result, x); d();
		}, neverCalled(a)).end();
	},
	"Then callback run in next tick": function (t, a, d) {
		var invoked = false;
		t({}).then(function (result) {
			invoked = true; d();
		}).end();
		a.equal(invoked, false);
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a.equal(t(p), p);
	},
	"Error returns rejected promise": function (t, a, d) {
		var x = new Error('Test');
		t(x).then(neverCalled(a), function (e) {
			a.equal(e, x); d();
		}).end();
	},
	"End with custom error handler": function (t, a, d) {
		var x = new Error('Test');
		t(x).end(function (e) {
			a.equal(e, x); d();
		});
	}
};
