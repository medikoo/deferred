'use strict';

var apply = require('./apply-async');

module.exports = function (fn, args, resolve) {
	var value;
	try {
		value  = apply.call(this, fn, args, resolve);
	} catch (e) {
		value = e;
	}
	if (value !== undefined) {
		resolve(value);
	}
};
