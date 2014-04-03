'use strict';

var isPromise = require('../is-promise');

module.exports = function (t, a) {
	var rejected = t('elo');
	a(isPromise(rejected), true, "Promise");
	a(rejected.failed, true, "Rejected");
	a(rejected.value, 'elo', "value");
};
