// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

'use strict';

var value    = require('es5-ext/lib/Object/valid-value')
  , deferred = require('../../deferred')
  , reject   = require('../../reject')

  , reduce = Array.prototype.reduce;

deferred.extend('get', function (/*…name*/) {
	var def;
	if (!this.pending) {
		this.pending = [];
	}
	def = deferred();
	this.pending.push('get', [arguments, def.resolve, def.reject]);
	return def.promise;

}, function (args, resolve, reject) {
	var result;
	if (this.failed) reject(this.value);
	try {
		result = reduce.call(args, function (obj, key) {
			return value(obj)[String(key)];
		}, this.value);
	} catch (e) {
		reject(e);
		return;
	}
	resolve(result);
}, function (/*…name*/) {
	var result;
	if (this.failed) return this;
	try {
		result = reduce.call(arguments, function (obj, key) {
			return value(obj)[String(key)];
		}, this.value);
	} catch (e) {
		return reject(e);
	}
	return deferred(result);
});
