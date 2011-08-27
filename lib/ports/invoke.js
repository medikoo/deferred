'use strict';

var applyBind   = require('es5-ext/lib/Function/apply-bind')
  , slice       = require('es5-ext/lib/List/slice').call;

require('../port').add('invoke', function (name) {
	if (this.failed) {
		return this.then;
	} else {
		return this.then(applyBind(this.value[name], this.value,
			slice(arguments, 1)));
	}
});
