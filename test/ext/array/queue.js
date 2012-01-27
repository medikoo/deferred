'use strict';

var deferred = require('../../../lib/deferred')
  , promise  = require('../../../lib/promise');

module.exports = function (t, a) {
	var x = {}, arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return {
		"Waiting": function (a) {
			var count = 0, ps = [], res = 1, p;
			p = t.call(arr, 3, function (item, index, list) {
				a(item, count + 1, "Item");
				a(index, count, "Index");
				a(list, arr, "List");
				a(this, x, "Context");
				++count;
				var d = deferred();
				ps.push(d.resolve);
				return d.promise;
			}, x);
			a(count, 3, "Limit");
			ps.shift()(res = res + res);
			a(count, 4, "Limit");
			ps.shift()(res = res + res);
			a(count, 5, "Limit");
			while (ps.length) {
				ps.shift()(res = res + res);
			}
			a(count, 10, "All run");
			p(function (res) {
				a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
			}).end();
		},
		"Synchronous": function (a) {
			var count = 0, res = 1;
			t.call(arr, 3, function (item, index, list) {
				a(item, count + 1, "Item");
				a(index, count, "Index");
				a(list, arr, "List");
				a(this, x, "Context");
				++count;
				return res = res + res;
			}, x)(function (res) {
				a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
			}).end();
		},
		"Synchronous promises": function (a) {
			var count = 0, res = 1;
			t.call(arr, 3, function (item, index, list) {
				a(item, count + 1, "Item");
				a(index, count, "Index");
				a(list, arr, "List");
				a(this, x, "Context");
				++count;
				return promise(res = res + res);
			}, x)(function (res) {
				a.deep(res, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], "Result");
			}).end();
		}
	};
};
