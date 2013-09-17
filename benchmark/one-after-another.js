'use strict';

// Benchmark comparing overhead introduced by promise implementations
// (one by after another)
// To run it, do following in package path:
//
// $ npm install Q jquery when
// $ node benchmark/one-after-another.js

var forEach    = require('es5-ext/object/for-each')
  , pad        = require('es5-ext/string/#/pad')
  , lstat      = require('fs').lstat
  , Q          = require('Q')
  , kew        = require('kew')
  , jqDeferred = require('jquery').Deferred
  , when       = require('when')
  , deferred   = require('../lib')

  , now = Date.now
  , Deferred = deferred.Deferred, promisify = deferred.promisify
  , nextTick = process.nextTick

  , self, time, count = 10000, data = {}, next, tests, def = deferred();

console.log("Promise overhead (calling one after another)",
	"x" + count + ":\n");

tests = [function () {
	var i = count;
	self = function () {
		lstat(__filename, function (err, stats) {
			if (err) throw err;
			if (--i) {
				self(stats);
			} else {
				// Ignroe first one
				next();
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count;
	self = function () {
		lstat(__filename, function (err, stats) {
			if (err) throw err;
			if (--i) {
				self(stats);
			} else {
				data["Base (plain Node.js lstat call)"] = now() - time;
				next();
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat;

	dlstat = function (path) {
		var def = new Deferred();
		lstat(path, function (err, stats) { def.resolve(err || stats); });
		return def.promise;
	};

	self = function () {
		dlstat(__filename).end(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Deferred: Dedicated wrapper"] = now() - time;
				next();
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat = promisify(lstat);

	self = function () {
		dlstat(__filename).end(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Deferred: Promisify (generic wrapper)"] = now() - time;
				next();
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat;

	dlstat = function (path) {
		var def = kew.defer();
		lstat(path, function (err, stats) {
			if (err) {
				def.reject(err);
			} else {
				def.resolve(stats);
			}
		});
		return def;
	};

	self = function () {
		dlstat(__filename).then(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["kew: Dedicated wrapper"] = now() - time;
				// Get out of try/catch clause
				nextTick(next);
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat;

	dlstat = function (path) {
		var def = Q.defer();
		lstat(path, function (err, stats) {
			if (err) def.reject(err);
			else def.resolve(stats);
		});
		return def.promise;
	};

	self = function () {
		dlstat(__filename).done(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Q: Dedicated wrapper"] = now() - time;
				// Get out of try/catch clause
				nextTick(next);
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat = Q.nbind(lstat, null);

	self = function () {
		dlstat(__filename).done(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Q: nbind (generic wrapper)"] = now() - time;
				// Get out of try/catch clause
				nextTick(next);
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat;

	dlstat = function (path) {
		var def = jqDeferred();
		lstat(path, function (err, stats) {
			if (err) def.reject(err);
			else def.resolve(stats);
		});
		return def;
	};

	self = function () {
		dlstat(__filename).done(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["jQuery.Deferred: Dedicated wrapper"] = now() - time;
				next();
			}
		}).fail(function (e) { throw e; });
	};
	time = now();
	self();
}, function () {
	var i = count, dlstat;

	dlstat = function (path) {
		var def = when.defer();
		lstat(path, function (err, stats) {
			if (err) def.reject(err);
			else def.resolve(stats);
		});
		return def.promise;
	};

	self = function () {
		dlstat(__filename).then(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["When: Dedicated wrapper"] = now() - time;
				nextTick(next);
			}
		}, function (e) {
			nextTick(function () { throw e; });
		});
	};
	time = now();
	self();
}];

next = function () {
	setTimeout(function () {
		if (tests.length) {
			tests.shift()();
		} else {
			def.resolve();
			forEach(data, function (value, name, obj, index) {
				console.log(index + 1 + ":",  pad.call(value, " ", 5) + "ms ", name);
			}, null, function (a, b) { return this[a] - this[b]; });
		}
	}, 100);
};

next();
