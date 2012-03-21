// 'match' - Promise extensions
//
// promise.match(onsuccess, onerror)
//
// Matches eventual list result onto function arguments,
// otherwise works same as 'then' (promise function itself)

'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , match      = require('es5-ext/lib/Function/prototype/match')
  , back       = require('../../promise').back;

require('../../extend')('match', null, function (args, resolve) {
	var win = args[0], fail = args[1];
	return back.then.call(this, (!this.failed && isFunction(win)) ?
			match.call(win) : win, fail, resolve);
});

module.exports = require('../../deferred');
