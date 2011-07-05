'use strict';

var path      = require('path')
  , merge     = require('es5-ext/lib/Object/plain/merge').call
  , indexTest = require('tad/lib/utils/index-test')

  , deferred  = require('../lib/deferred')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)
		.then(function (o) {
			delete o.deferred;
			delete o.chain;
			return indexTest.readDir(dir + '/chain')
				.then(function (o2) {
					delete o2.base;
					return merge(o, o2);
				});
		}), "index"),
	"Deferred function is main object": function (t, a) {
		a.equal(t, deferred);
	}
};
