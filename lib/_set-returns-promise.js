'use strict';

var defineProperty = Object.defineProperty
  , descriptor = { configurable: false, enumerable: false, value: true,
		writable: false };

module.exports = function (fn) {
	fn.returnsPromise = true;
	return defineProperty(fn, 'returnsPromise', descriptor);
};
