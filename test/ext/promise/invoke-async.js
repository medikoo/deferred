'use strict';

var deferred = require('../../../deferred');

module.exports = function () {
	return {
		"Function": function (a, d) {
			var x = {}, z = {};
			z.foo = function (y, cb) {
				var self = this;
				setTimeout(function () {
					cb(null, self, y);
				}, 0);
				return 3;
			};
			deferred(z).invokeAsync('foo', x)(function (r) {
				a.deep(r, [z, x]);
			}).done(d, d);
		},
		"Method": function (a, d) {
			var x = {}, fn, z = {};
			fn = function (y, cb) {
				var self = this;
				setTimeout(function () {
					cb(null, self, y);
				}, 0);
				return 3;
			};
			deferred(z).invokeAsync(fn, x)(function (r) {
				a.deep(r, [z, x]);
			}).done(d, d);
		},
		"Fail": function (a) {
			var e = new Error("Error");
			deferred(e).invokeAsync('bla')(a.never, function (r) {
				a(r, e);
			}).done();
		},
		"Null input": function (a) {
			deferred(null).invokeAsync('test')(a.never, function (e) {
				a.ok(e instanceof TypeError);
			}).done();
		},
		"No Function": function (a) {
			deferred({}).invokeAsync('test')(a.never, function (e) {
				a.ok(e instanceof TypeError);
			}).done();
		},
		"Promise arguments": function (a) {
			var y = {}, z = {}, x = { foo: function (w, u, cb) {
				a(this, x, "Context");
				a.deep([w, u], [y, z], "Arguments");
				cb(null, 'foo');
			} };
			deferred(x).invokeAsync('foo', deferred(y), z)(function (r) {
				a(r, 'foo', "Result");
			}, a.never).done();
		},
		"Erroneous": function (a, d) {
			var x, fn;
			x = new Error('Test');
			fn = function (callback) {
				setTimeout(function () {
					callback(x);
				}, 0);
			};
			deferred({}).invokeAsync(fn)(a.never, function (e) {
				a(e, x);
			}).done(d, d);
		},
		"Function crash": function (a) {
			var x = new Error('Test'), fn;
			fn = function () {
				throw x;
			};
			deferred({}).invokeAsync(fn)(a.never, function (e) {
				a(e, x);
			}).done();
		}
	};
};
