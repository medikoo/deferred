'use strict';

var toArray = require('es5-ext/lib/Array/from')
  , promise = require('../../../lib/promise');

module.exports = function (t) {
	var u = {}, x = {}, y = {}, z = {}, fn1 = function () {};
	return {
		"Normal arguments": function (a) {
			t(function (fn, args) {
				a(this, u, "Context");
				a(fn, fn1, "Function");
				a.deep(toArray(args), [x, y, z]);
			}).call(fn1).call(u, x, y, z);
		},
		"Promise arguments": function (a) {
			t(function (fn, args) {
				a(this, u, "Context");
				a(fn, fn1, "Function");
				args.end(function (args) {
					a.deep(toArray(args), [x, y, z]);
				}, null);
			}).call(fn1).call(u, x, promise(y), z);
		},
		"Promise argument": function (a) {
			t(function (fn, args) {
				a(this, u, "Context");
				a(fn, fn1, "Function");
				args.end(function (args) {
					a.deep(toArray(args), [y]);
				}, null);
			}).call(fn1).call(u, promise(y));
		},
		"Length": function (a) {
			t(function (fn, args) {
				a(this, u, "Context");
				a(fn, fn1, "Function");
				args.end(function (args) {
					a.deep(toArray(args), [x, y]);
				}, null);
			}).call(fn1, 2).call(u, promise(x), y, z);

			t(function (fn, args) {
				a(this, u, "Context");
				a(fn, fn1, "Function");
				a.deep(toArray(args), [x, undefined, undefined]);
			}).call(fn1, 3).call(u, x);
		},
		"Do not promisify promisified function": function (a) {
			var conv = t(function () { });
			var fn = conv.call(fn1);
			a(fn, conv.call(fn));
		}
	};
};
