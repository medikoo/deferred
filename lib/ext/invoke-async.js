'use strict';

var slice      = Array.prototype.slice
  , isFunction = require('es5-ext/lib/Function/is-function')
  , a2p        = require('../_apply_async_fn')

	, deferred    = require('../deferred');

require('../base').add('invokeAsync', function (name) {
	var d = deferred();
	this._base.invokeAsync(name, slice.call(arguments, 1), d.resolve);
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
	a2p(fn, this._value, args, resolve);
});
