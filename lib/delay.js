// Delay function execution, return promise for function result

'use strict';

var deferred = require('./deferred');

module.exports = function (fn, timeout) {
	var d = deferred();
	setTimeout(function () {
		d.resolve(fn());
	}, timeout);
	return d.promise;
};
