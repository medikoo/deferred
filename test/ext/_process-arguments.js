'use strict';

var isPromise = require('../../lib/is-promise')
  , promise   = require('../../lib/promise')
  , deferred  = require('../../lib/deferred');

module.exports = function (t) {
	var x = {}, y = {}, e = new Error();
	return {
		"Limit": function (a) {
			a.deep(t([x, 34, 'raz'], 2), [x, 34]);
		},
		"Extend": function (a) {
			a.deep(t([x, 34, 'raz'], 5), [x, 34, 'raz', undefined, undefined]);
		},
		"Promise arguments": {
			"Resolved": {
				"": function (a) {
					a.deep(t([x, promise(y), 'dwa', promise(null)]), [x, y, 'dwa', null]);
				},
				"Error": function (a) {
					var p = promise(e);
					a(t([x, p, 'dwa', promise(null)]), p);
				}
			},
			"Unresolved": {
				"": function (a) {
					var py = deferred(), px = deferred(), p;
					p = t([x, py.promise, 'dwa', px.promise]);
					a(isPromise(p), true, "Promise");
					p.end(function (args) {
						a.deep(args, [x, y, 'dwa', x]);
					}, a.never);
					py.resolve(y);
					px.resolve(x);
				},
				"Error": function (a) {
					var py = deferred(), px = deferred(), p;
					p = t([x, py.promise, 'dwa', px.promise]);
					a(isPromise(p), true, "Promise");
					p.end(a.never, function (err) {
						a(err, e);
					});
					py.resolve(y);
					px.resolve(e);
				}
			}
		}
	};
};
