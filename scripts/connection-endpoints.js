"use strict";

var augurNode = process.env.AUGUR_WS || "ws://127.0.0.1:9001";
var ethereumNode = {
  http: process.env.ETHEREUM_HTTP || "http://127.0.0.1:8545",
};
if (process.env.ETHEREUM_WS != null) ethereumNode.ws = process.env.ETHEREUM_WS;

module.exports.augurNode = augurNode;
module.exports.ethereumNode = ethereumNode;
