"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var depleteOtherShareBalances = require("../../../../src/trading/simulation/deplete-other-share-balances");

describe("trading/simulation/deplete-other-share-balances", function () {
  var test = function (t) {
    it(t.description, function () {
      t.assertions(depleteOtherShareBalances(t.params.outcome, t.params.sharesDepleted, t.params.shareBalances));
    });
  };
  test({
    description: "Two outcomes, deplete all but outcome 2",
    params: {
      outcome: 2,
      sharesDepleted: new BigNumber("1", 10),
      shareBalances: [new BigNumber("3", 10), new BigNumber("3", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, [new BigNumber("2", 10), new BigNumber("3", 10)]);
    }
  });
  test({
    description: "Five outcomes, deplete all but outcome 1",
    params: {
      outcome: 1,
      sharesDepleted: new BigNumber("2", 10),
      shareBalances: [
        new BigNumber("4", 10),
        new BigNumber("3.1", 10),
        new BigNumber("2", 10),
        new BigNumber("2", 10),
        new BigNumber("13.37", 10)
      ]
    },
    assertions: function (output) {
      assert.deepEqual(output, [
        new BigNumber("4", 10),
        new BigNumber("1.1", 10),
        new BigNumber("0", 10),
        new BigNumber("0", 10),
        new BigNumber("11.37", 10)
      ]);
    }
  });
});
