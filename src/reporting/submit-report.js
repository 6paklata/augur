"use strict";

var speedomatic = require("speedomatic");
var api = require("../api");

/**
 * @param {Object} p Parameters object.
 * @param {string} p.market Address of the market to finalize, as a hex string.
 * @param {string[]} p._payoutNumerators Relative payout amounts to traders holding shares of each outcome, as an array of base-10 strings.
 * @param {string} p._amountToStake Amount of Reporting tokens to stake on this report, as a base-10 string.
 * @param {buffer|function=} p._signer Can be the plaintext private key as a Buffer or the signing function to use.
 * @param {function} p.onSent Called if/when the transaction is broadcast to the network.
 * @param {function} p.onSuccess Called if/when the transaction is sealed and confirmed.
 * @param {function} p.onFailed Called if/when the transaction fails.
 */
function submitReport(p) {
  api().Market.getReportingToken({
    tx: { to: p.market },
    _payoutNumerators: p._payoutNumerators
  }, function (reportingTokenAddress) {
    api().ReportingToken.buy({
      _signer: p._signer,
      tx: { to: reportingTokenAddress },
      _amountToStake: speedomatic.fix(p._amountToStake, "hex"),
      onSent: p.onSent,
      onSuccess: p.onSuccess,
      onFailed: p.onFailed
    });
  });
}

module.exports = submitReport;
