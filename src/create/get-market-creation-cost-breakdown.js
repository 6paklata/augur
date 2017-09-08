"use strict";

/** Type definition for MarketCreationCosts.
 * @typedef {Object} MarketCreationCosts
 * @property {string} targetReporterGasCosts Amount of Ether required to pay for the gas to Report on this market, as a base-10 string.
 * @property {string} validityBond Amount of Ether to be held on-contract and repaid when the market is resolved with a non-Invalid outcome, as a base-10 string.
 */

var async = require("async");
var speedomatic = require("speedomatic");
var api = require("../api");

/**
 * @param {Object} p Parameters object.
 * @param {string} p.branchID Branch on which to create this market.
 * @param {number} p._endTime Market expiration timestamp, in seconds.
 * @param {function} callback Called when all market creation costs have been looked up.
 * @return {MarketCreationCosts} Cost breakdown for creating a new market.
 */
function getMarketCreationCostBreakdown(p, callback) {
  api().Branch.getReportingWindowByTimestamp({
    tx: { to: p.branchID },
    _timestamp: p._endTime
  }, function (reportingWindowAddress) {
    if (!reportingWindowAddress) return callback({ error: "getReportingWindowByTimestamp failed" });
    if (reportingWindowAddress.error) return callback(reportingWindowAddress);
    async.parallel({
      targetReporterGasCosts: function (next) {
        api().MarketFeeCalculator.getTargetReporterGasCosts(function (targetReporterGasCosts) {
          if (!targetReporterGasCosts) return next({ error: "getTargetReporterGasCosts failed" });
          if (targetReporterGasCosts.error) return next(targetReporterGasCosts);
          next(null, speedomatic.unfix(targetReporterGasCosts, "string"));
        });
      },
      validityBond: function (next) {
        api().MarketFeeCalculator.getValidityBond({ _reportingWindow: reportingWindowAddress }, function (validityBond) {
          if (!validityBond) return next({ error: "getValidityBond failed" });
          if (validityBond.error) return next(validityBond);
          next(null, speedomatic.unfix(validityBond, "string"));
        });
      }
    }, function (err, marketCreationCostBreakdown) {
      if (err) return callback(err);
      callback(null, marketCreationCostBreakdown);
    });
  });
}

module.exports = getMarketCreationCostBreakdown;
