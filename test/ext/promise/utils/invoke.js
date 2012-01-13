'use strict';

var slice    = Array.prototype.slice
  , deferred = require('../../../../lib/deferred');

module.exports = function (t) {
	var x = {}, y = {}, z = {}, fn, fn2;
	require('../../../../lib/extend')('$test-invoke', null,
		function (args, resolve) {
			var fn = args[0];
			args = slice.call(args, 1);
			t(this, fn, args, require('../../../../lib/ext/utils/apply-async'),
				resolve);
		});

	fn = function (y, cb) {
		var a = this;
		setTimeout(function () {
			cb(null, a, y);
		}, 0);
	};
	fn2 = function (x, y, cb) {
		var a = this;
		setTimeout(function () {
			cb(null, a, x, y);
		}, 0);
	};
	return {
		"Fail": function (a, d) {
			var e = new Error("Error");
			deferred(e)['$test-invoke']('bla')
			(a.never, function (r) {
				a(r, e); d();
			}).end();
		},
		"Method": function (a, d) {
			deferred(x)['$test-invoke'](fn, y)
			(function (r) {
				a.deep(r, [x, y]); d();
			}, a.never);
		},
		"Function name": function (a, d) {
			x.foo = fn;
			deferred(x)['$test-invoke']('foo', y)
			(function (r) {
				a.deep(r, [x, y]); d();
			}, a.never);
		},
		"Promise arguments": function (a, d) {
			x.foo = fn2;
			deferred(x)['$test-invoke']('foo', deferred(y), z)
			(function (r) {
				a.deep(r, [x, y, z]); d();
			}, a.never);
		},
		"Promise argument": function (a, d) {
			x.foo = fn;
			deferred(x)['$test-invoke']('foo', deferred(y))
			(function (r) {
				a.deep(r, [x, y]); d();
			}, a.never);
		}
	};
};
