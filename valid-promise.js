"use strict";

var isPromise = require("./is-promise");

module.exports = function (value) {
	if (!isPromise(value)) {
		throw new TypeError(value + " is not a promise object");
	}
	return value;
};
