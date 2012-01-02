'use strict';

var path       = require('path')
  , readdir    = require('fs').readdir
  , isFunction = require('es5-ext/lib/Function/is-function')
  , merge      = require('es5-ext/lib/Object/prototype/merge')
  , convert    = require('es5-ext/lib/String/prototype/dash-to-camel-case')
  , indexTest  = require('tad/lib/utils/index-test')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)(function (o) {
		delete o.deferred;
		delete o.join;
		delete o.isPromise;
		delete o.ext;
		delete o.extend;
		delete o.promise;
		return o;
		return indexTest.readDir(dir + '/join')
			.then(function (o2) {
				delete o2.base;
				o2.join = o2.default;
				delete o2.default;
				return merge.call(o, o2);
			});
	}), ['delay', 'promisify']),
	"Delay": function (t, a, d) {
		var x = {};
		t.delay(function (r) {
			return r
		}, 5)(x)(function (r) {
			a(r, x); d();
		});
	},
	"Promisify": function (t, a, d) {
		var x = {};
		t.promisify(function (cb) {
			cb(null, x);
		})()(function (r) {
			a(r, x); d();
		});
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
				var name;
				if ((file.slice(-3) === '.js') && (file[0] !== '_')) {
					a(isFunction(p[name = convert.call(file.slice(0, -3))]), true, name);
				}
			});
			d();
		});
	}
};
