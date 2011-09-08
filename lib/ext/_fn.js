'use strict';

var toArray  = require('es5-ext/lib/List/to-array').call
  , base     = require('../base')

  , deferred = require('../deferred')

module.exports = function (name, fn) {
	base.add(name, function () {
		var d = deferred();
		this._base[name](arguments, d.resolve);
		return d.promise;
	}, function (args, resolve) {
		if (this._failed) {
			resolve(this._promise);
		} else {
			resolve(fn.apply(null, [this._value].concat(toArray(args))));
		}
	});
};

