'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , curry      = require('es5-ext/lib/Function/curry').call
  , silent     = require('es5-ext/lib/Function/silent').apply
  , nextTick   = require('clock/lib/next-tick')

  , deferred    = require('../deferred');

require('../base').add('invoke', function (name) {
	var d = deferred();
	this._base.invoke(name, slice.call(arguments, 1), d.resolve);
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
	nextTick(curry(resolve, silent(fn.bind(this._value), args)));
});
