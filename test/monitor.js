"use strict";

var isValue  = require("es5-ext/object/is-value")
  , deferred = require("../deferred");

module.exports = function (t, a, d) {
	var invoked, df, cachet, cachec;
	cachet = t.timeout;
	cachec = t.callback;
	t(100, function (stack) {
		a.ok(stack instanceof Error);
		invoked = true;
	});
	df = deferred();
	setTimeout(function () {
		a(invoked, true, "Invoked");
		t(isValue(cachet) ? cachet : false, cachec);
		df.resolve();
		d();
	}, 150);
};
