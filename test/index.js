'use strict';

var path       = require('path')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , merge      = require('es5-ext/lib/Object/plain/merge').call
  , indexTest  = require('tad/lib/utils/index-test')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)(function (o) {
		delete o.deferred;
		delete o.join;
		delete o.isPromise;

		return indexTest.readDir(dir + '/join')
			.then(function (o2) {
				delete o2.base;
				o2.join = o2.default;
				delete o2.default;
				return merge(o, o2);
			});
	}), "index"),
	"Deferred function is main object": function (t, a) {
		var d = t();
		d.resolve({});
		a.ok(isFunction(d.resolve) && isFunction(d.promise.then));
	}
};
