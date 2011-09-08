'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , silent     = require('es5-ext/lib/Function/silent').apply
  , slice      = require('es5-ext/lib/List/slice/call')

  , deferred    = require('../deferred');

require('../base').add('invoke', function (name) {
	var d = deferred();
	this._base.invoke(name, slice(arguments, 1), d.resolve);
	return d.promise;
}, function (name, args, resolve) {
	var fn;
	if (this._failed) {
		resolve(this._promise);
		return;
	}
	if (isFunction(name)) {
		fn = name;
	} else if (!isFunction(this._value[name])) {
		resolve(new Error("Cannot invoke '" + name +
			"' on given result. It's not a function."));
		return;
	} else {
		fn = this._value[name];
	}
	resolve(silent(fn.bind(this._value), args));
});
