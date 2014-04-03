'use strict';

var deferred = require('../deferred');

module.exports = function (t, a) {
	a(t(deferred().resolve()), true, "Deferred promise is promise");
	a(t(deferred({})), true, "Object promise is promise");
};
