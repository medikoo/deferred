'use strict';

var path       = require('path')
  , readdir    = require('fs').readdir
  , isFunction = require('es5-ext/lib/Function/is-function')
  , not        = require('es5-ext/lib/Function/prototype/not')
  , contains   = require('es5-ext/lib/Array/prototype/contains')
  , merge      = require('es5-ext/lib/Object/prototype/merge')
  , convert    = require('es5-ext/lib/String/prototype/dash-to-camel-case')
  , indexTest  = require('tad/lib/utils/index-test')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)(function (o) {
		delete o.deferred;
		delete o.join;
		delete o.ext;
		delete o.extend;
		delete o.promise;
		return o;
	}), ['delay', 'promisify', 'promisifyAsync', 'promisifySync', 'map',
		'reduce']),
	"isPromise": function (t, a) {
		a(t.isPromise(t(null)), true);
		a(t.isPromise({}), false);
	},
	"Delay": function (t, a, d) {
		var x = {};
		t.delay(function (r) {
			return r;
		}, 5)(x)(function (r) {
			a(r, x);
		}).end(d);
	},
	"Promisify": function (t, a, d) {
		var x = {};
		t.promisify(function (cb) {
			cb(null, x);
		})()(function (r) {
			a(r, x);
		}).end(d);
	},
	"PromisifyAsync": function (t, a, d) {
		var x = {};
		t.promisifyAsync(function (cb) {
			setTimeout(cb.bind(null, null, x), 0);
			return {};
		})()(function (r) {
			a(r, x);
		}).end(d);
	},
	"PromisifySync": function (t, a, d) {
		t.promisifySync(function () {
			return;
		})()(function (r) {
			a(r, undefined);
		}).end(d);
	},
	"Map": function (t, a, d) {
		var x = {};
		t.map([t(1), t(2), 3], function (res) {
			return t(res * res);
		})(function (r) {
			a.deep(r, [1, 4, 9]);
		}, a.never).end(d);
	},
	"Reduce": function (t, a, d) {
		var x = {};
		t.reduce([t(1), t(2), 3], function (arg1, arg2) {
			return t(arg1 * arg2);
		}, 1)(function (r) {
			a(r, 6);
		}, a.never).end(d);
	},
	"Deferred function is main object": function (t, a) {
		var d = t();
		d.resolve({});
		a.ok(isFunction(d.resolve) && isFunction(d.promise.then));
	},
	"Ports are loaded": function (t, a, d) {
		var p = t().resolve();
		readdir(dir + '/ext/promise', function (err, files) {
			if (err) {
				d(err);
				return;
			}
			files.map(function (file) {
				if ((file.slice(-3) === '.js') && (file[0] !== '_')) {
					return convert.call(file.slice(0, -3));
				}
			}).filter(Boolean).forEach(function (file) {
				a(isFunction(p[file]), true, file);
			});
			d();
		});
	}
};
