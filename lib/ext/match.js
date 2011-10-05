'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , match      = require('es5-ext/lib/Function/match').call

  , deferred   = require('../deferred');

require('../base').add('match', function (win, fail) {
	var d = deferred();
	this._base.match(win, fail, d.resolve);
	return d.promise;
}, function (win, fail, resolve) {
	this.then((!this._failed && isFunction(win)) ? match(win) : win, fail,
		resolve);
});
