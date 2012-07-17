// 'get' - Promise extension
//
// promise.get(name)
//
// Resolves with property of resolved object

'use strict';

var defineProperty = Object.defineProperty
  , reduce         = Array.prototype.reduce
  , d              = require('es5-ext/lib/Object/descriptor')
  , value          = require('es5-ext/lib/Object/valid-value')
  , deferred       = require('../../deferred')
  , promise        = require('../../promise');

defineProperty(promise.unresolved, 'get', d(function (name) {
	var def;
	if (!this.pending) {
		this.pending = [];
	}
	def = deferred();
	this.pending.push('get', [arguments, def.resolve]);
	return def.promise;

}));

promise.onswitch.get = function (args, resolve) {
	var result;
	if (this.failed) {
		resolve(this.value);
	}
	try {
		result = reduce.call(args, function (obj, key) {
			return value(obj)[String(key)];
		}, this.value);
	} catch (e) {
		result = e;
	}
	return resolve(result);
};

defineProperty(promise.resolved, 'get', d(function (name) {
	var result;
	if (this.failed) {
		return this;
	}
	try {
		result = reduce.call(arguments, function (obj, key) {
			return value(obj)[String(key)];
		}, this.value);
	} catch (e) {
		result = e;
	}
	return promise(result);
}));

module.exports = require('../../deferred');
