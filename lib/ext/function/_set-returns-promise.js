'use strict';

var defineProperty = Object.defineProperty
  , descriptor = { configurable: false, enumerable: false, value: true,
		writable: false };

module.exports = function (fn) {
	return defineProperty(fn, 'returnsPromise', descriptor);
};
