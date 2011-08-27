'use strict';

var deferred = require('../lib/deferred')
  , promise  = require('../lib/promise');

module.exports = {
	"End": {
		"Deferred": function (t, a, d) {
			var defer = deferred(), x = new Error('Test error'), p;
			defer.resolve(1);
			p = defer.promise(function () {
				throw x;
			});
			a(p.end(function (e) {
				a(e, x); d();
			}), p, "Returns self promise");
		},
		"Promise": function (t, a, d) {
			var x = new Error('Test'), p;
			p = promise(x);
			a(p.end(function (e) {
				a(e, x); d();
			}), p, "Returns self promise");
		}
	}
};
