'use strict';

var applyBind = require('es5-ext/lib/Function/apply-bind')
  , slice     = require('es5-ext/lib/List/slice').call
  , a2p       = require('../async-to-promise').apply;

require('../port').add('invokeAsync', function (name) {
	if (this.failed) {
		return this.then;
	} else {
		return a2p(this.value[name], slice(arguments, 1));
	}
});
