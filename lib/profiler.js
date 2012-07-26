'use strict';

var partial = require('es5-ext/lib/Function/prototype/partial')
  , forEach = require('es5-ext/lib/Object/for-each')
  , pad     = require('es5-ext/lib/String/prototype/pad')
  , promise = require('./promise')
  , resolved, rStats, unresolved, uStats, profile;

exports.profile = function () {
	resolved = 0, rStats = {}, unresolved = 0, uStats = {};
	promise._profile = profile;
};

profile = function (isResolved) {
	var stack, data;

	if (isResolved) {
		++resolved;
		data = rStats;
	} else {
		++unresolved;
		data = uStats;
	}

	stack = (new Error()).stack;
	if (!stack.split('\n').slice(3).some(function (line) {
		if ((line.indexOf('/deferred/') === -1) &&
			(line.indexOf('/es5-ext/') === -1) &&
			(line.indexOf(' (native)') === -1)) {
			line = line.replace(/\n/g, "\\n").trim();
			if (!data[line]) {
				data[line] = { count: 0 };
			}
			++data[line].count;
			return true;
		}
	})) {
		if (!data.unknown) {
			data.unknown = { count: 0, stack: stack };
		}
		++data.unknown.count;
	}
};

exports.profileEnd = function (output) {
	var total, lpad;

	if (!promise._profile) {
		console.error("Deferred/Promise profiler was not initilized");
		return;
	}
	delete promise._profile;

	if (output) {
		console.log("");
		console.log("------------------------------------------------------------");
		console.log('Deferred/Promise usage statistics:');

		console.log("");
		total = String(resolved + unresolved);
		lpad = partial.call(pad, ' ', total.length);
		console.log(total, "Total promises initialized");
		console.log(lpad.call(unresolved), "Initialized as Unresolved");
		console.log(lpad.call(resolved), "Initialized as Resolved");

		if (unresolved) {
			console.log("");
			console.log("Unresolved promises were initialized at:");
			forEach(uStats, function (data, name) {
				console.log(lpad.call(data.count), name);
			}, null, function (a, b) {
				return this[b].count - this[a].count;
			});
		}

		if (resolved) {
			console.log("");
			console.log("Resolved promises were initialized at:");
			forEach(rStats, function (data, name) {
				console.log(lpad.call(data.count), name);
			}, null, function (a, b) {
				return this[b].count - this[a].count;
			});
		}
		console.log("------------------------------------------------------------");
		console.log("");
	}

	return {
		resolved: { count: resolved, stats: rStats },
		unresolved: { count: unresolved, stats: uStats }
	};
};
