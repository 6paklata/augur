"use strict";

var assign = require("lodash.assign");
var immutableDelete = require("immutable-delete");
var speedomatic = require("speedomatic");
var getTradeAmountRemaining = require("./get-trade-amount-remaining");
var api = require("../api");
var noop = require("../utils/noop");
var constants = require("../constants");

/**
 * @param {Object} p Parameters object.
 * @param {number} p._direction Order type (0 for "buy", 1 for "sell").
 * @param {string} p._market Market in which to trade, as a hex string.
 * @param {number} p._outcome Outcome ID to trade, must be an integer value on [1, 8].
 * @param {string} p._fxpAmount Number of shares to trade, as a base-10 string.
 * @param {string} p._fxpPrice Normalized limit price for this trade, as a base-10 string.
 * @param {string=} p._tradeGroupID ID logged with each trade transaction (can be used to group trades client-side), as a hex string.
 * @param {boolean=} p.doNotMakeOrders If set to true, this trade will only take existing orders off the book, not create new ones (default: false).
 * @param {buffer|function=} p._signer Can be the plaintext private key as a Buffer or the signing function to use.
 * @param {function} p.onSent Called when the first trading transaction is broadcast to the network.
 * @param {function} p.onSuccess Called when the full trade completes successfully.
 * @param {function} p.onFailed Called if any part of the trade fails.
 */
function tradeUntilAmountIsZero(p) {
  if (speedomatic.unfix(p._fxpAmount).lte(constants.PRECISION.zero)) {
    return p.onSuccess(null);
  }
  var tradePayload = assign({}, immutableDelete(p, "doNotMakeOrders"), {
    _fxpAmount: speedomatic.fix(p._fxpAmount, "hex"),
    _fxpPrice: speedomatic.fix(p._fxpPrice, "hex"),
    onSuccess: function (res) {
      getTradeAmountRemaining({ transactionHash: res.hash }, function (err, fxpTradeAmountRemaining) {
        if (err) return p.onFailed(err);
        tradeUntilAmountIsZero(assign({}, p, {
          _fxpAmount: speedomatic.unfix(fxpTradeAmountRemaining, "string"),
          onSent: noop // so that p.onSent only fires when the first transaction is sent
        }));
      });
    }
  });
  if (p.doNotMakeOrders) {
    api().Trade.publicTakeBestOrder(tradePayload);
  } else {
    api().Trade.publicTrade(tradePayload);
  }
}

module.exports = tradeUntilAmountIsZero;
