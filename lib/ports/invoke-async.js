'use strict';

var applyBind  = require('es5-ext/lib/Function/apply-bind')
  , isFunction = require('es5-ext/lib/Function/is-function')
  , slice      = require('es5-ext/lib/List/slice').call
  , a2p        = require('../async-to-promise').apply;

require('../port').add('invokeAsync', function (name) {
	if (this.failed) {
		return this.then;
	} else {
		return a2p(isFunction(name) ? name.bind(this.value) :
			this.value[name].bind(this.value), slice(arguments, 1));
	}
});
