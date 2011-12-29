'use strict';

var path       = require('path')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , merge      = require('es5-ext/lib/Object/prototype/merge')
  , indexTest  = require('tad/lib/utils/index-test')

  , dir = path.dirname(__dirname) + '/lib';

module.exports = {
	"": indexTest(indexTest.readDir(dir)(function (o) {
		delete o.deferred;
		delete o.join;
		delete o.isPromise;
		delete o.ext;
		delete o.base;
		delete o.asyncFn;
		return o;
		return indexTest.readDir(dir + '/join')
			.then(function (o2) {
				delete o2.base;
				o2.join = o2.default;
				delete o2.default;
				return merge.call(o, o2);
			});
	}), ['afn', 'bafn']),
	"Deferred function is main object": function (t, a) {
		var d = t();
		d.resolve({});
		a.ok(isFunction(d.resolve) && isFunction(d.promise.then));
	},
	"Ports are loaded": function (t, a) {
		var p = t().resolve();
		a.ok(p.all, "All");
		a.ok(p.cb, "Cb");
		a.ok(p.first, "First");
		a.ok(p.invoke, "Invoke");
		a.ok(p.invokeAsync, "Invoke async");
		a.ok(p.join, "Join");
	}
};
