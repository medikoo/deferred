// 'aside' - Promise extension
//
// promise.aside(win, fail)
//
// Works in analogous way as promise function itself (or `then`)
// but instead of adding promise to promise chain it returns context promise and
// lets callback carry on with other processing logic

"use strict";

var isValue  = require("es5-ext/object/is-value")
  , callable = require("es5-ext/object/valid-callable")
  , deferred = require("../../deferred");

deferred.extend(
	"aside",
	function (win, fail) {
		if (isValue(win)) callable(win);
		if (isValue(fail)) callable(fail);
		if (win || fail) {
			if (!this.pending) {
				this.pending = [];
			}
			this.pending.push("aside", arguments);
		}
		return this;
	},
	function (win, fail) {
		var cb = this.failed ? fail : win;
		if (cb) {
			cb(this.value);
		}
	},
	function (win, fail) {
		var cb;
		if (isValue(win)) callable(win);
		if (isValue(fail)) callable(fail);
		cb = this.failed ? fail : win;
		if (cb) {
			cb(this.value);
		}
		return this;
	}
);
