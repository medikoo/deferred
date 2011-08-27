'use strict';

module.exports = {
	"Object promise resolves to same object": function (t, a, d) {
		var x = {};
		t(x)(function (result) {
			a(result, x); d();
		}, a.never).end();
	},
	"Then callback run in next tick": function (t, a, d) {
		var invoked = false;
		t({})(function (result) {
			invoked = true; d();
		}).end();
		a(invoked, false);
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a(t(p), p);
	},
	"Error returns rejected promise": function (t, a, d) {
		var x = new Error('Test');
		t(x)(a.never, function (e) {
			a(e, x); d();
		}).end();
	}
};
