"use strict";

var speedomatic = require("speedomatic");
var rpcInterface = require("../rpc-interface");

/**
 * @param {Object} p Parameters object.
 * @param {string} p.etherToSend Amount of Ether to send, as a base-10 string.
 * @param {string} p.to Ethereum address of the recipient, as a hexadecimal string.
 * @param {buffer|function=} p._signer Can be the plaintext private key as a Buffer or the signing function to use.
 * @param {function} p.onSent Called if/when the transaction is broadcast to the network.
 * @param {function} p.onSuccess Called if/when the transaction is sealed and confirmed.
 * @param {function} p.onFailed Called if/when the transaction fails.
 */
function sendEther(p) {
  return rpcInterface.transact({
    from: p.from,
    to: p.to,
    value: speedomatic.fix(p.etherToSend, "hex"),
    returns: "null",
    gas: "0xcf08"
  }, p._signer, p.onSent, p.onSuccess, p.onFailed);
}

module.exports = sendEther;
