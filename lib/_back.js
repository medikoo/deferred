'use strict';

var silent     = require('es5-ext/lib/Function/prototype/silent')
  , isCallable = require('es5-ext/lib/Object/is-callable');

exports.then =  function (win, fail, resolve) {
	var cb = this._failed ? fail : win;
	resolve((cb == null) ? this._promise :
		(isCallable(cb) ? silent.call(cb, this._value) : cb));
};

exports.end =  function (handler) {
	if (this._failed) {
		if (isCallable(handler)) {
			handler(this._value);
		} else {
			throw this._value;
		}
	}
};
