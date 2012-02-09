'use strict';

var noop      = require('es5-ext/lib/Function/noop')
  , isPromise = require('../lib/is-promise')

  , x = {};

module.exports = {
	"No arguments": function (t, a, d) {
		var defer = t();
		a(isPromise(defer.promise), true, "Promise");
		defer.resolve(x)(function (res) {
			a(res, x, "Resolve");
			d();
		});
	},
	"One argument": function (t, a, d) {
		var p = t(x);
		a(isPromise(p), true, "Got promise");
		p(function (res) {
			a(res, x, "Promise for passed value");
			d();
		});
	},
	"More than one argument": function (t, a) {
		var x = {}, y = {};
		return {
			"Success": function (a, d) {
				t(t(x), y, null)(function (r) {
					a.deep(r, [x, y, null]);
					d();
				}).end();
			},
			"Error": function (a, d) {
				var d1 = t(), v, res = false;
				setTimeout(d1.resolve, 20);
				t(t(x), d1.promise(function () {
					a(res, true, "Resolved");
					d();
				}), v = new Error("Error"), {})(a.never, function (e) {
					a(e, v);
					res = true;
				}).end();
			},
			"Resolve not via then": function (a) {
				var d = t();
				t(1, d.promise).end(function () {
					throw new Error("ERROR");
				});
				a.throws(d.resolve);
			}
		};
	},
	"Only first resolve is taken": function (t, a) {
		var defer = t();
		defer.promise.end();
		defer.resolve(1);
		defer.resolve(2);
		a(defer.promise.valueOf(), 1);
	}
};
