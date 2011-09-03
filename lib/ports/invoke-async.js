'use strict';

var applyBind  = require('es5-ext/lib/Function/apply/bind')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , slice      = require('es5-ext/lib/List/slice/call')
  , a2p        = require('../async-to-promise').apply

	, promise    = require('../promise');

require('../port').add('invokeAsync', function (name) {
	var fn;
	if (this.failed) {
		return this.then;
	} else {
		if (isFunction(name)) {
			fn = name;
		} else if (!isFunction(this.value[name])) {
			promise(new Error("Cannot invoke '" + name + "' on given result. It's not a function."));
		} else {
			fn = this.value[name];
		}
		return a2p(fn.bind(this.value), slice(arguments, 1));
	}
});
