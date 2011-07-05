'use strict';

var deferred = require('../lib/deferred')
  , promise  = require('../lib/promise');

module.exports = {
	"Deferred promise is promise": function (t, a) {
		a.equal(t(deferred().promise), true);
	},
	"Object promise is promise": function (t, a) {
		a.equal(t(promise({})), true);
	}
};
