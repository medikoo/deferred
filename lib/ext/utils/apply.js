'use strict';

var apply = require('./apply-async');

module.exports = function (fn, args, resolve, length) {
	var value;
	try {
		value  = apply.call(this, fn, args, resolve, length);
	} catch (e) {
		value = e;
	}
	if (value !== undefined) {
		resolve(value);
	}
};
