"use strict";

var speedomatic = require("speedomatic");
var api = require("../api");

/**
 * @param {Object} p Parameters object.
 * @param {string} p.branchID Branch on which to create this market.
 * @param {number} p._endTime Market expiration timestamp, in seconds.
 * @param {function} callback Called after the market creation cost has been looked up.
 * @return {string} Total cost of creating a new market (= validity bond + target reporter gas costs), as a base-10 string.
 */
function getMarketCreationCost(p, callback) {
  api().Branch.getReportingWindowByTimestamp({
    tx: { to: p.branchID },
    _timestamp: p._endTime
  }, function (err, reportingWindowAddress) {
    if (err) return callback(err);
    api().MarketFeeCalculator.getMarketCreationCost({ _reportingWindow: reportingWindowAddress }, function (err, marketCreationCost) {
      if (err) return callback(err);
      callback(null, speedomatic.unfix(marketCreationCost, "string"));
    });
  });
}

module.exports = getMarketCreationCost;
