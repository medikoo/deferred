// Whether given object is a promise

"use strict";

module.exports = function (value) {
	return (
		typeof value === "function" && typeof value.then === "function" && value.end !== value.done
	);
};
