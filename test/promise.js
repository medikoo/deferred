'use strict';

module.exports = {
	"Object promise resolves to same object": function (t, a, d) {
		var x = {};
		t(x)(function (result) {
			a(result, x); d();
		}, a.never).end();
	},
	"Then callback run in next tick": function (t, a, d) {
		var invoked = false;
		t({})(function (result) {
			invoked = true; d();
		}).end();
		a(invoked, false);
	},
	"Promise returns promise": function (t, a) {
		var p = t({});
		a(t(p), p);
	},
	"Error returns rejected promise": function (t, a, d) {
		var x = new Error('Test');
		t(x)(a.never, function (e) {
			a(e, x); d();
		}).end();
	},
	"End with custom error handler": function (t, a, d) {
		var x = new Error('Test'), p;
		p = t(x);
		a(p.end(function (e) {
			a(e, x); d();
		}), p, "Returns self promise");
	},
	"Regular async callback": function (t, a, d) {
		var x = {};
		a(t(x).cb(function (err, res) {
			a(err, null, "Error object is null");
			a(res, x); d();
		}), undefined, "Does not return anything");
	},
	"Regular async callback, error": function (t, a, d) {
		var x = new Error('Error');
		t(x).cb(function (err, res) {
			a(err, x);
			a(res, null, "Result is null"); d();
		});
	},
	"Join": function (t, a, d) {
		var x = 0, e = new Error();
		t([1,2,3]).join(function (y) {
			return y == 1 ? e : y;
		})
		(function (r) {
			a.deep(r, [e, 2, 3]); d();
		}, d).end();
	},
	"First": function (t, a, d) {
		var x = 0;
		t([1,2,3]).first(function (y) {
			return y == 1 ? new Error() : y;
		})
		(function (r) {
			a(r, 2); d();
		}, d).end();
	},
	"All": {
		"": function (t, a, d) {
			var x = 0
			t([1,2,3]).all(function (y) {
				return x += y;
			})
			(function (r) {
				a.deep(r, [1, 3, 6]); d();
			}, d).end();
		},
		"Error": function (t, a, d) {
			var x = 0, e = new Error();
			t([1,2,3]).all(function (y) {
				return y == 1 ? e : y;
			})
			(a.never, function (r) {
				a(r, e); d();
			}).end();
		}
	},
	"Invoke": function (t, a, d) {
		var z = {}, x = { bar: z }
		  , y = { foo: function (n) { return x[n]; } };
		t(y).invoke('foo', 'bar')
		(function (r) {
			a(r, z); d();
		}, d).end();
	}
};
