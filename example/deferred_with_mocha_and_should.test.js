/*
 * Example demonstrating the use of deferred in the context of unit tests with
 * the mocha and should modules.
 *
 * Usage:
 * $ mocha test/deferred_with_mocha_and_should.test.js
 */

var should = require('should');
var deferred = require('deferred');

describe("Async functions with promises", function() {

    it("should produce a result without error", function(done) {

        var asyncFunc1 = function(params) {
            console.log("params:", params);
            var def = deferred();

            // Some async processing
            setTimeout(function() {
                def.resolve(params + 'with');
            }, 100);

            return def.promise();
        };

        var asyncFunc2 = function(params) {
            console.log("params:", params);
            var def = deferred();

            // Some async processing
            setTimeout(function() {
                def.resolve(params + 'some');
            }, 100);

            return def.promise();
        };

        var asyncFunc3 = function(params) {
            console.log("params:", params);
            var def = deferred();

            // Some async processing
            setTimeout(function() {
                def.resolve(params + 'more');
            }, 100);

            return def.promise();
        };

        asyncFunc1('Intial_value').
            then(asyncFunc2).
            then(asyncFunc3)(
                function(result) {
                    console.log("The final result is:", result);
                    should.exist(result);
                    done();
                },
                function(err) {
                    should.not.exist(err);
                    done();
                }).done();
    });

});
