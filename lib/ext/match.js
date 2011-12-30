'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , match      = require('es5-ext/lib/Function/prototype/match')
  , back       = require('../_back');

require('../extend')('match', null, function (args, resolve) {
	var win = args[0], fail = args[1];
	back.then.call(this, (!this._failed && isFunction(win)) ? match.call(win) :
		win, fail, resolve);
});

module.exports = require('../deferred');
