'use strict';

var toArray  = require('es5-ext/lib/Object/prototype/to-array')
  , base     = require('../_base')

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
			resolve(fn.apply(null, [this._value].concat(toArray.call(args))));
		}
	});
};

