define(function(require, exports, module) {
    'use strict';

    var deferred = require('./lib/deferred');

    var asyncFunc1, asyncFunc2, asyncFunc3;

    asyncFunc1 = function (params) {
	console.log("params:", params);
	var def = deferred();

	// Some async processing
	setTimeout(function () {
	    def.resolve(params + 'with');
	}, 100);

	return def.promise;
    };

    asyncFunc2 = function (params) {
	console.log("params:", params);
	var def = deferred();

	// Some async processing
	setTimeout(function () {
	    def.resolve(params + 'some');
	}, 100);

	return def.promise;
    };

    asyncFunc3 = function (params) {
	console.log("params:", params);
	var def = deferred();

	// Some async processing
	setTimeout(function () {
	    def.resolve(params + 'more');
	}, 100);

	return def.promise;
    };

    asyncFunc1('Intial_value')
	.then(asyncFunc2)
	.then(asyncFunc3)
	.done(function (result) {
	    console.log("Final result is:", result);
	}, function (err) {
	    console.error(err);
	});

});