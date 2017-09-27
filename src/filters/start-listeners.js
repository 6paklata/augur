"use strict";

var addFilter = require("./add-filter");
var parseBlockMessage = require("./parse-message/parse-block-message");
var subscriptions = require("./subscriptions");
var contracts = require("../contracts");
var ethrpc = require("../rpc-interface");
var isFunction = require("../utils/is-function");

/**
 * Start listening for specified events emitted by the Ethereum blockchain.
 * @param {Object.<function>} onLogAddedCallbacks Callbacks to fire when events are received, keyed by contract name and event name.
 * @param {function=} onNewBlock Callbacks to fire when events are received, keyed by contract name and event name.
 * @param {function=} onSetupComplete Called when all listeners are successfully set up.
 */
function startListeners(onLogAddedCallbacks, onNewBlock, onSetupComplete) {
  var eventsAbi = contracts.abi.events;
  var blockStream = ethrpc.getBlockStream();
  if (isFunction(onNewBlock)) {
    blockStream.subscribeToOnBlockAdded(function (message) {
      parseBlockMessage(message, onNewBlock);
    });
  }
  Object.keys(onLogAddedCallbacks).forEach(function (contractName) {
    Object.keys(onLogAddedCallbacks[contractName]).forEach(function (eventName) {
      if (isFunction(onLogAddedCallbacks[contractName][eventName]) && eventsAbi[contractName] && eventsAbi[contractName][eventName]) {
        addFilter(blockStream, contractName, eventName, eventsAbi[contractName][eventName], contracts[ethrpc.getNetworkID()], subscriptions.addSubscription, onLogAddedCallbacks[contractName][eventName]);
      }
    });
  });
  blockStream.subscribeToOnLogAdded(subscriptions.onLogAdded);
  blockStream.subscribeToOnLogRemoved(subscriptions.onLogRemoved);
  if (isFunction(onSetupComplete)) onSetupComplete();
}

module.exports = startListeners;
