'use strict';

var applyBind  = require('es5-ext/lib/Function/apply-bind')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , slice      = require('es5-ext/lib/List/slice').call;

require('../port').add('invoke', function (name) {
	if (this.failed) {
		return this.then;
	} else {
		return this.then(applyBind(isFunction(name) ? name : this.value[name],
			this.value, slice(arguments, 1)));
	}
});
