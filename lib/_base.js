// Default ports for deferred

'use strict';

var base

base = {
	promise: {},
	resolved: {},
	unresolved: {}
};

exports.get = function () {
	return base;
};

exports.add = function (name, promise, resolved) {
	base.promise[name] = promise;
	base.resolved[name] = resolved;
	base.unresolved[name] = function () {
		this._pending.push([name, arguments]);
	};
};
