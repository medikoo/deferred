'use strict';

var slice    = Array.prototype.slice
  , deferred = require('../../../../lib/deferred');

module.exports = function (t) {
	var x = {}, y = {}, z = {}, fn, fn2, count;
	require('../../../../lib/extend')('$test-invoke', null,
		function (args, resolve) {
			var fn = args[0];
			args = slice.call(args, 1);
			return t(this, fn, args, require('../../../../lib/ext/utils/apply-async'),
				resolve, true);
		});

	count = 0;
	fn = function (y, cb) {
		var a = this;
		++count;
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
			deferred(e)['$test-invoke']('bla')(a.never, function (r) {
				a(r, e);
			}).end(d);
		},
		"Method": function (a, d) {
			deferred(x)['$test-invoke'](fn, y)(function (r) {
				a.deep(r, [x, y]);
			}, a.never).end(d);
		},
		"Function name": function (a, d) {
			x.foo = fn;
			count = 0;
			deferred(x)['$test-invoke']('foo', y)(function (r) {
				a(count, 1, "Once");
				a.deep(r, [x, y]);
			}, a.never).end(d);
		},
		"Promise arguments": function (a, d) {
			x.foo = fn2;
			deferred(x)['$test-invoke']('foo', deferred(y), z)(function (r) {
				a.deep(r, [x, y, z]);
			}, a.never).end(d);
		},
		"Promise argument": function (a, d) {
			x.foo = fn;
			deferred(x)['$test-invoke']('foo', deferred(y))(function (r) {
				a.deep(r, [x, y]);
			}, a.never).end(d);
		}
	};
};
