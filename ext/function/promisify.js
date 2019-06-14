// Promisify asynchronous function

"use strict";

var isValue         = require("es5-ext/object/is-value")
  , callable        = require("es5-ext/object/valid-callable")
  , toNaturalNumber = require("es5-ext/number/to-pos-integer")
  , callAsync       = require("./call-async")._base;

module.exports = function (length) {
	var fn, result;
	fn = callable(this);
	if (fn.returnsPromise) return fn;
	if (isValue(length)) length = toNaturalNumber(length);
	result = function () { return callAsync(fn, length, this, arguments); };
	result.returnsPromise = true;
	return result;
};
