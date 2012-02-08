'use strict';

var apply = require('./apply-async');

module.exports = function (fn, args, resolve, length) {
	var value;
	if ((value = apply.call(this, fn, args, resolve, length)) !== undefined) {
		resolve(value);
	}
};
