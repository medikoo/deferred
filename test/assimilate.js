'use strict';

var deferred = require('../deferred')

  , x = {};

module.exports = {
	"then": {
		"Resolve": function (t, a, d) {
			t({ then: function (resolve) {
				resolve(x);
			} }).done(function (value) {
				a(value, x);
				d();
			}, a.never);
		},
		"Reject": function (t, a, d) {
			t({ then: function (resolve, reject) {
				reject(x);
			} }).done(a.never, function (value) {
				a(value, x);
				d();
			});
		}
	},
	"done": {
		"Resolve": function (t, a) {
			t({ then: function () {}, done: function (resolve) {
				resolve(x);
			} }).done(function (value) {
				a(value, x);
			}, a.never);
		},
		"Reject": function (t, a) {
			t({ then: function () {}, done: function (resolve, reject) {
				reject(x);
			} }).done(a.never, function (value) {
				a(value, x);
			});
		}
	},
	"via then": function (t, a, d) {
		deferred('marko').then(function () {
			return { then: function (resolve) {
				resolve('foreign');
			} };
		}).done(function (value) {
			a(value, 'foreign');
			d();
		});
	}
};
