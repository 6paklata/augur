"use strict";

var ethrpc = require("../rpc-interface");
var findEventLogsInLogArray = require("../events/find-event-logs-in-log-array");
var isObject = require("../utils/is-object");

function getMarketFromCreateMarketReceipt(transactionHash, callback) {
  ethrpc.getTransactionReceipt(transactionHash, function (receipt) {
    console.log("receipt for", transactionHash, receipt);
    if (!isObject(receipt) || receipt.error) return callback(new Error("Transaction receipt not found for " + transactionHash));
    var marketCreatedLogs = findEventLogsInLogArray("Augur", "MarketCreated", receipt.logs);
    console.log("marketCreatedLogs:", marketCreatedLogs);
    if (marketCreatedLogs == null || !marketCreatedLogs.length || marketCreatedLogs[0] == null || marketCreatedLogs[0].market == null) {
      return callback(new Error("MarketCreated log not found for " + transactionHash));
    }
    callback(null, marketCreatedLogs[0].market);
  });
}

module.exports = getMarketFromCreateMarketReceipt;
