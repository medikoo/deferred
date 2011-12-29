'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , curry      = require('es5-ext/lib/Function/prototype/curry')
  , silent     = require('es5-ext/lib/Function/prototype/silent')
  , nextTick   = require('clock/lib/next-tick')

  , deferred    = require('../deferred');

require('../_base').add('invoke', function (name) {
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
	nextTick(curry.call(resolve, silent.apply(fn.bind(this._value), args)));
});

module.exports = deferred;
