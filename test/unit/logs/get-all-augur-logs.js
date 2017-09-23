/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var proxyquire = require("proxyquire").noPreserveCache();

describe("logs/get-all-augur-logs", function () {
  var test = function (t) {
    it(t.description, function (done) {
      var getAllAugurLogs = proxyquire("../../../src/logs/get-all-augur-logs", {
        "../contracts": t.mock.contracts,
        "../rpc-interface": t.stub.rpcInterface
      });
      getAllAugurLogs(t.params, function (err, allAugurLogs) {
        t.assertions(err, allAugurLogs);
        done();
      });
    });
  };
  test({
    description: "from block 10 to block 1000, 2 chunks, 3 event logs",
    params: {
      fromBlock: 10,
      toBlock: 1000
    },
    mock: {
      contracts: {
        4: {
          TestContractName: "0x000000000000000000000000000000000000000c"
        },
        abi: {
          events: {
            TestContractName: {
              TestEventName: {
                inputs: [{
                  indexed: true,
                  type: "int256",
                  name: "testEventInputIndexed"
                }, {
                  indexed: false,
                  type: "address",
                  name: "testEventInputData"
                }],
                type: "event",
                name: "TestEventName(int256,address)",
                signature: "0x1000000000000000000000000000000000000000000000000000000000000000"
              }
            }
          }
        }
      }
    },
    stub: {
      rpcInterface: {
        getLogs: function (p, callback) {
          assert.deepEqual(p.address, ["0x000000000000000000000000000000000000000c"]);
          if (p.fromBlock === 10) {
            callback([{
              address: "0x000000000000000000000000000000000000000c",
              topics: [
                "0x1000000000000000000000000000000000000000000000000000000000000000",
                "0x2000000000000000000000000000000000000000000000000000000000000000"
              ],
              data: "0x0000000000000000000000000000000000000000000000000000000000000001",
              blockNumber: "0xe",
              transactionIndex: "0x0",
              transactionHash: "0x000000000000000000000000000000000000000000000000000000000000000a",
              blockHash: "0x000000000000000000000000000000000000000000000000000000000000000b",
              logIndex: "0x0",
              removed: false
            }]);
          } else {
            callback([{
              address: "0x000000000000000000000000000000000000000c",
              topics: [
                "0x1000000000000000000000000000000000000000000000000000000000000000",
                "0x3000000000000000000000000000000000000000000000000000000000000000"
              ],
              data: "0x0000000000000000000000000000000000000000000000000000000000000002",
              blockNumber: "0x384",
              transactionIndex: "0x0",
              transactionHash: "0x00000000000000000000000000000000000000000000000000000000000000aa",
              blockHash: "0x00000000000000000000000000000000000000000000000000000000000000bb",
              logIndex: "0x0",
              removed: false
            }, {
              address: "0x000000000000000000000000000000000000000c",
              topics: [
                "0x1000000000000000000000000000000000000000000000000000000000000000",
                "0x3000000000000000000000000000000000000000000000000000000000000000"
              ],
              data: "0x0000000000000000000000000000000000000000000000000000000000000003",
              blockNumber: "0x385",
              transactionIndex: "0x0",
              transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000aaa",
              blockHash: "0x0000000000000000000000000000000000000000000000000000000000000bbb",
              logIndex: "0x0",
              removed: false
            }]);
          }
        },
        getNetworkID: function () {
          return "4";
        }
      }
    },
    assertions: function (err, allAugurLogs) {
      assert.isNull(err);
      assert.deepEqual(allAugurLogs, {
        TestContractName: {
          TestEventName: [{
            testEventInputIndexed: "0x3000000000000000000000000000000000000000000000000000000000000000",
            testEventInputData: "0x0000000000000000000000000000000000000000000000000000000000000003",
            blockNumber: 901,
            transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000aaa",
            removed: false
          }, {
            testEventInputIndexed: "0x3000000000000000000000000000000000000000000000000000000000000000",
            testEventInputData: "0x0000000000000000000000000000000000000000000000000000000000000002",
            blockNumber: 900,
            transactionHash: "0x00000000000000000000000000000000000000000000000000000000000000aa",
            removed: false
          }, {
            testEventInputIndexed: "0x2000000000000000000000000000000000000000000000000000000000000000",
            testEventInputData: "0x0000000000000000000000000000000000000000000000000000000000000001",
            blockNumber: 14,
            transactionHash: "0x000000000000000000000000000000000000000000000000000000000000000a",
            removed: false
          }]
        }
      });
    }
  });
});
