'use strict';

var toArray   = require('es5-ext/lib/Object/prototype/to-array')
  , isPromise = require('../lib/is-promise');

module.exports = function (t, a) {
	var def, x = {}, y = {}, z = {}, u = {}, v = {};
	return {
		"Both": function (a, d) {
			def = t('$test:both', function (arg1, arg2) {
				this._base.next('$test:both', [y, z]);
				return [arg1, arg2, x];
			}, function (arg1, arg2) {
				a.deep([arg1, arg2], [y, z], "Back");
				d();
			});

			a.deep(def(null)['$test:both'](u, v), [u, v, x], "Front");
		},
		"Front": function (a) {
			def = t('$test:front', function (arg1, arg2) {
				return [arg1, x, arg2];
			});

			a.deep(def(null)['$test:front'](u, v), [u, x, v], "Front");
		},
		"Back": function (a, d) {
			var p;
			def = t('$test:back', null, function (args, resolve) {
				a.deep(toArray.call(args), [x, y], "Back: args");
				return resolve(v);
			});
			a(isPromise(p = def(null)['$test:back'](x, y)), true, "Front");
			p(function (arg) {
				a(arg, v, "Back: resolve");
			}).end(d);
		}
	};
};
