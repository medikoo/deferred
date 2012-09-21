'use strict';

// Benchmark comparing overhead introduced by promise implementations
// (one by after another)
// To run it, do following in package path:
//
// $ npm install Q jquery
// $ node benchmark/one-after-another.js

var forEach    = require('es5-ext/lib/Object/for-each')
  , pad        = require('es5-ext/lib/String/prototype/pad')
  , lstat      = require('fs').lstat
  , Q          = require('Q')
  , jqDeferred = require('jquery').Deferred
  , deferred   = require('../lib')

  , now = Date.now
  , Deferred = deferred.Deferred
  , promisify = deferred.promisify

  , self, time, count = 10000, data = {}, next, tests, def = deferred();

console.log("Promise overhead (calling one after another)",
	"x" + count + ":\n");

tests = [function () {
	var i = count;
	self = function () {
		lstat(__filename, function (err, stats) {
			if (err) {
				throw err;
			}
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
		lstat(path, function (err, stats) {
			def.resolve(err || stats);
		});
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
		var def = Q.defer();
		lstat(path, function (err, stats) {
			if (err) {
				def.reject(err);
			} else {
				def.resolve(stats);
			}
		});
		return def.promise;
	};

	self = function () {
		dlstat(__filename).then(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Q: Dedicated wrapper"] = now() - time;
				next();
			}
		});
	};
	time = now();
	self();
}, function () {
	var i = count;

	self = function () {
		Q.ncall(lstat, null, __filename).then(function (stats) {
			if (--i) {
				self(stats);
			} else {
				data["Q: ncall (generic wrapper)"] = now() - time;
				next();
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
			if (err) {
				def.reject(err);
			} else {
				def.resolve(stats);
			}
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
		});
	};
	time = now();
	self();
}];

next = function () {
	if (tests.length) {
		tests.shift()();
	} else {
		def.resolve();
		forEach(data, function (value, name, obj, index) {
			console.log(index + 1 + ":",  pad.call(value, " ", 5) + "ms ", name);
		}, null, function (a, b) {
			return this[a] - this[b];
		});
	}
};

next();
