'use strict';

var applyBind  = require('es5-ext/lib/Function/apply-bind')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , slice      = require('es5-ext/lib/List/slice').call

	, promise    = require('../promise');

require('../port').add('invoke', function (name) {
	var fn;
	if (this.failed) {
		return this.then;
	} else {
		if (isFunction(name)) {
			fn = name;
		} else if (!isFunction(this.value[name])) {
			return promise(new Error("Cannot invoke '" + name + "' on given result. It's not a function."));
		} else {
			fn = this.value[name];
		}
		return this.then(applyBind(fn, this.value, slice(arguments, 1)));
	}
});
