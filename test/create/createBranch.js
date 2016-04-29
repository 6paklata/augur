/**
 * augur.js tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var augur = require("../../src");
var random = require("../random");
var runner = require("../runner");

var noop = function () {};

describe("Unit tests", function () {
    runner("eth_sendTransaction", [{
        method: "createSubbranch",
        parameters: ["string", "int", "hash", "fixed", "bool"]
    }]);
    describe("createBranch", function () {
        var test = function (params) {
            var count = 0;
            var createSubbranch = augur.createSubbranch;
            augur.createSubbranch = function (subparams) {
                it(JSON.stringify(params), function () {
                    assert.strictEqual(params.description, subparams.description);
                    assert.strictEqual(params.periodLength, subparams.periodLength);
                    assert.strictEqual(params.parent, subparams.parent);
                    assert.strictEqual(params.tradingFee, subparams.tradingFee);
                    assert.strictEqual(params.oracleOnly || 0, subparams.oracleOnly);
                    assert.isFunction(subparams.onSent);
                    assert.isFunction(subparams.onSuccess);
                    assert.isFunction(subparams.onFailed);
                });
                if (!params.onSent) {
                    params.onSent = noop;
                    params.onSuccess = noop;
                    params.onFailed = noop;
                    return augur.createBranch(params);
                }
                augur.createSubbranch = createSubbranch;
            };
            augur.createBranch(
                params.description,
                params.periodLength,
                params.parent,
                params.tradingFee,
                params.oracleOnly,
                noop,
                noop,
                noop
            );
        };
        for (var i = 0; i < augur.constants.UNIT_TEST_SAMPLES; ++i) {
            test({
                description: random.string(),
                periodLength: random.int(),
                parent: random.hash(),
                tradingFee: random.fixed(),
                oracleOnly: random.bool()
            });
        }
    });
});
