'use strict';

var map              = Array.prototype.map
  , invoke           = require('es5-ext/lib/Function/invoke')
  , noop             = require('es5-ext/lib/Function/noop')
  , create           = require('es5-ext/lib/Object/prototype/plain-create')

  , promise, proto;

proto = {
	resolved: false,
	resolve: function (value) {
		if (this.resolved) {
			return this.promise;
		}
		this.resolved = true;
		return this.promise._base.resolve(value);
	}
};

module.exports = function deferred (value) {
	var o, l, args, d;
	if ((l = arguments.length)) {
		if (l > 1) {
			d = deferred();
			args = map.call(arguments, promise);
			args.forEach(function (arg) {
				arg(noop, d.resolve);
			});
			args.reduce(function (a, b) {
				return a(b);
			})
			(function () {
				d.resolve(args.map(invoke('valueOf')));
			}, noop).end();
			return d.promise;
		} else {
			return promise(value);
		}
	}

	o = create.call(proto, {
		promise: promise()
	});

	return {
		resolve: o.resolve.bind(o),
		promise: o.promise
	};
};

promise = require('./promise')
