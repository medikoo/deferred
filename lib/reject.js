'use strict';

var Deferred = require('./deferred').Deferred;

module.exports = function (value) {
	var deferred = new Deferred();
	deferred.reject(value);
	return deferred.promise;
};
