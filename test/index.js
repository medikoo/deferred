'use strict';

var path       = require('path')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , merge      = require('es5-ext/lib/Object/plain/merge').call
  , indexTest  = require('tad/lib/utils/index-test')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)
		.then(function (o) {
			delete o.deferred;
			delete o.chain;
			delete o.isPromise;
			delete o.promise;

			return indexTest.readDir(dir + '/chain')
				.then(function (o2) {
					delete o2.base;
					return merge(o, o2);
				});
		}), "index"),
	"Deferred function is main object": function (t, a) {
		var d = t();
		d.resolve({});
		a.ok(isFunction(d.resolve) && isFunction(d.promise.then));
	}
};
