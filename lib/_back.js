'use strict';

var silent     = require('es5-ext/lib/Function/prototype/silent')
  , isCallable = require('es5-ext/lib/Object/is-callable');

exports.then =  function (win, fail, resolve) {
	var cb = this.failed ? fail : win;
	resolve((cb == null) ? this.promise :
		(isCallable(cb) ? silent.call(cb, this.value) : cb));
};

exports.end =  function (handler) {
	if (this.failed) {
		if (isCallable(handler)) {
			handler(this.value);
		} else {
			throw this.value;
		}
	}
};
