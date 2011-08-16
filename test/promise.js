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
	},
	"End with custom error handler": function (t, a, d) {
		var x = new Error('Test');
		t(x).end(function (e) {
			a(e, x); d();
		});
	},
	"Regular async callback": function (t, a, d) {
		var x = {};
		a(t(x).cb(function (err, res) {
			a(err, null, "Error object is null");
			a(res, x); d();
		}), undefined, "Does not return anything");
	},
	"Regular async callback, error": function (t, a, d) {
		var x = new Error('Error');
		t(x).cb(function (err, res) {
			a(err, x);
			a(res, null, "Result is null"); d();
		});
	}
};
