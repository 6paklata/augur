/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var simulateTakeAskOrder = require("../../../../src/trading/simulation/simulate-take-ask-order");
var constants = require("../../../../src/constants");
var ZERO = constants.ZERO;

describe("trading/simulation/simulate-take-ask-order", function () {
  var test = function (t) {
    it(t.description, function () {
      var output;
      try {
        output = simulateTakeAskOrder(t.params.sharesToCover, t.params.minPrice, t.params.maxPrice, t.params.marketCreatorFeeRate, t.params.reportingFeeRate, t.params.shouldCollectReportingFees, t.params.matchingSortedAsks, t.params.outcome, t.params.shareBalances);
      } catch (exc) {
        output = exc;
      }
      t.assertions(output);
    });
  };
  test({
    description: "maker closing long, taker closing short",
    params: {
      sharesToCover: new BigNumber("3", 10),
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      matchingSortedAsks: [{
        amount: "2",
        fullPrecisionPrice: "0.7",
        sharesEscrowed: "2"
      }],
      outcome: 1,
      shareBalances: [ZERO, new BigNumber("5", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        sharesToCover: new BigNumber("1", 10),
        settlementFees: new BigNumber("0.006", 10),
        gasFees: ZERO,
        otherSharesDepleted: new BigNumber("2", 10),
        tokensDepleted: ZERO,
        shareBalances: [ZERO, new BigNumber("3", 10)]
      });
    }
  });
  test({
    description: "maker closing long, taker opening long",
    params: {
      sharesToCover: new BigNumber("2", 10),
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      matchingSortedAsks: [{
        amount: "2",
        fullPrecisionPrice: "0.7",
        sharesEscrowed: "2"
      }],
      outcome: 1,
      shareBalances: [ZERO, ZERO]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        sharesToCover: ZERO,
        settlementFees: ZERO,
        gasFees: ZERO,
        otherSharesDepleted: ZERO,
        tokensDepleted: new BigNumber("1.4", 10),
        shareBalances: [ZERO, ZERO]
      });
    }
  });
  test({
    description: "maker opening short, taker closing short",
    params: {
      sharesToCover: new BigNumber("1.5", 10),
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      matchingSortedAsks: [{
        amount: "2",
        fullPrecisionPrice: "0.7",
        sharesEscrowed: "0"
      }],
      outcome: 1,
      shareBalances: [ZERO, new BigNumber("5", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        sharesToCover: ZERO,
        settlementFees: ZERO,
        gasFees: ZERO,
        otherSharesDepleted: new BigNumber("1.5", 10),
        tokensDepleted: ZERO,
        shareBalances: [ZERO, new BigNumber("3.5", 10)]
      });
    }
  });
  test({
    description: "maker opening short, taker opening long",
    params: {
      sharesToCover: new BigNumber("2", 10),
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      matchingSortedAsks: [{
        amount: "2",
        fullPrecisionPrice: "0.7",
        sharesEscrowed: "0"
      }],
      outcome: 1,
      shareBalances: [ZERO, ZERO]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        sharesToCover: ZERO,
        settlementFees: ZERO,
        gasFees: ZERO,
        otherSharesDepleted: ZERO,
        tokensDepleted: new BigNumber("1.4", 10),
        shareBalances: [ZERO, ZERO]
      });
    }
  });
});
