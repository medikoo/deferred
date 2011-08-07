'use strict';

var deferred = require('../lib/deferred')
  , promise  = require('../lib/promise');

module.exports = function (t, a) {
	a(t(deferred().resolve()), true, "Deferred promise is promise");
	a(t(promise({})), true, "Object promise is promise");
};
