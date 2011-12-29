'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , match      = require('es5-ext/lib/Function/prototype/match')

  , deferred   = require('../deferred');

require('../_base').add('match', function (win, fail) {
	var d = deferred();
	this._base.match(win, fail, d.resolve);
	return d.promise;
}, function (win, fail, resolve) {
	this.then((!this._failed && isFunction(win)) ? match.call(win) : win, fail,
		resolve);
});
