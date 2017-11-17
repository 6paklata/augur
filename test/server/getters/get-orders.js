"use strict";

const assert = require("chai").assert;
const setupTestDb = require("../../test.database");
const { getOrders } = require("../../../build/server/getters/get-orders");

describe("server/getters/get-orders", () => {
  const test = (t) => {
    it(t.description, (done) => {
      setupTestDb((err, db) => {
        assert.isNull(err);
        getOrders(db, t.params.universe, t.params.marketID, t.params.outcome, t.params.orderType, t.params.creator, t.params.orderState, t.params.sortBy, t.params.isSortDescending, t.params.limit, t.params.offset, (err, openOrders) => {
          t.assertions(err, openOrders);
          done();
        });
      });
    });
  };
  test({
    description: "get open buy orders for market 1",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: null,
      orderType: "buy",
      creator: null,
      orderState: "OPEN",
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {
        "0x0000000000000000000000000000000000000001": {
          0: {
            buy: {
              "0x1000000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x1000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A00",
                transactionIndex: 0,
                owner: "0x0000000000000000000000000000000000000b0b",
                creationTime: 1506473500,
                creationBlockNumber: 1400001,
                orderState: "OPEN",
                price: 0.7,
                amount: 1,
                fullPrecisionPrice: 0.7,
                fullPrecisionAmount: 1,
                tokensEscrowed: 0.7,
                sharesEscrowed: 0,
              },
              "0x2000000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x1000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A01",
                transactionIndex: 0,
                owner: "0x000000000000000000000000000000000000d00d",
                creationTime: 1506473515,
                creationBlockNumber: 1400002,
                orderState: "OPEN",
                price: 0.6,
                amount: 2,
                fullPrecisionPrice: 0.600001,
                fullPrecisionAmount: 2,
                tokensEscrowed: 1.200002,
                sharesEscrowed: 0,
              },
              "0x5000000000000000000000000000000000000000000000000000000000000000": {
                amount: 1,
                creationBlockNumber: 1400001,
                creationTime: 1506473500,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A06",
                transactionIndex: 0,
                fullPrecisionAmount: 1,
                fullPrecisionPrice: 0.7,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.7,
                shareToken: "0x1000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 0.7,
              },
            },
          },
          1: {
            buy: {
              "0x3000000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x2000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A02",
                transactionIndex: 0,
                owner: "0x000000000000000000000000000000000000d00d",
                creationTime: 1506473515,
                creationBlockNumber: 1400002,
                orderState: "OPEN",
                price: 0.6,
                amount: 2,
                fullPrecisionPrice: 0.6,
                fullPrecisionAmount: 2.0000001,
                tokensEscrowed: 1.20000006,
                sharesEscrowed: 0,
              },
            },
          },
        },
      });
    },
  });
  test({
    description: "get open sell orders for market 1",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: null,
      orderType: "sell",
      creator: null,
      orderState: "OPEN",
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {
        "0x0000000000000000000000000000000000000001": {
          1: {
            sell: {
              "0x4000000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x2000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A03",
                transactionIndex: 0,
                owner: "0x000000000000000000000000000000000000d00d",
                creationTime: 1506473515,
                creationBlockNumber: 1400002,
                orderState: "OPEN",
                price: 0.6,
                amount: 2,
                fullPrecisionPrice: 0.6,
                fullPrecisionAmount: 2,
                tokensEscrowed: 1.2,
                sharesEscrowed: 0,
              },
            },
          },
        },
      });
    },
  });
  test({
    description: "get closed sell orders for market 1",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: null,
      orderType: "sell",
      creator: null,
      orderState: "CLOSED",
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {
        "0x0000000000000000000000000000000000000001": {
          1: {
            sell: {
              "0x4100000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x2000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A04",
                transactionIndex: 0,
                owner: "0x000000000000000000000000000000000000d00d",
                creationTime: 1506473515,
                creationBlockNumber: 1400002,
                orderState: "CLOSED",
                price: 0.7,
                amount: 2,
                fullPrecisionPrice: 0.7,
                fullPrecisionAmount: 2,
                tokensEscrowed: 1.2,
                sharesEscrowed: 0,
              },
            },
          },
        },
      });
    },
  });
  test({
    description: "get cancelled sell orders for market 1",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: "0x0000000000000000000000000000000000000001",
      outcome: null,
      orderType: "sell",
      creator: null,
      orderState: "CANCELED",
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {
        "0x0000000000000000000000000000000000000001": {
          1: {
            sell: {
              "0x4200000000000000000000000000000000000000000000000000000000000000": {
                shareToken: "0x2000000000000000000000000000000000000000",
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A05",
                transactionIndex: 0,
                owner: "0x000000000000000000000000000000000000d00d",
                creationTime: 1506473515,
                creationBlockNumber: 1400002,
                orderState: "CANCELED",
                price: 0.8,
                amount: 2,
                fullPrecisionPrice: 0.8,
                fullPrecisionAmount: 2,
                tokensEscrowed: 1.2,
                sharesEscrowed: 0,
              },
            },
          },
        },
      });
    },
  });
  test({
    description: "get orders created by user b0b",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: null,
      outcome: null,
      orderType: null,
      creator: "0x0000000000000000000000000000000000000b0b",
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {
        "0x0000000000000000000000000000000000000001": {
          0: {
            buy: {
              "0x1000000000000000000000000000000000000000000000000000000000000000": {
                amount: 1,
                creationBlockNumber: 1400001,
                creationTime: 1506473500,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A00",
                transactionIndex: 0,
                fullPrecisionAmount: 1,
                fullPrecisionPrice: 0.7,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.7,
                shareToken: "0x1000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 0.7,
              },
              "0x5000000000000000000000000000000000000000000000000000000000000000": {
                amount: 1,
                creationBlockNumber: 1400001,
                creationTime: 1506473500,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A06",
                transactionIndex: 0,
                fullPrecisionAmount: 1,
                fullPrecisionPrice: 0.7,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.7,
                shareToken: "0x1000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 0.7,
              },
            },
          },
        },
        "0x0000000000000000000000000000000000000003": {
          1: {
            sell: {
              "0x8000000000000000000000000000000000000000000000000000000000000000": {
                amount: 2,
                creationBlockNumber: 1400002,
                creationTime: 1506473515,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A09",
                transactionIndex: 0,
                fullPrecisionAmount: 2,
                fullPrecisionPrice: 0.6,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.6,
                shareToken: "0x2000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 1.2,
              },
            },
          },
        },
        "0x0000000000000000000000000000000000000011": {
          1: {
            buy: {
              "0x7000000000000000000000000000000000000000000000000000000000000000": {
                amount: 2,
                creationBlockNumber: 1400002,
                creationTime: 1506473515,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A08",
                transactionIndex: 0,
                fullPrecisionAmount: 2.0000001,
                fullPrecisionPrice: 0.6,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.6,
                shareToken: "0x2000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 1.20000006,
              },
            },
          },
        },
        "0x0000000000000000000000000000000000000018": {
          0: {
            buy: {
              "0x6000000000000000000000000000000000000000000000000000000000000000": {
                amount: 2,
                creationBlockNumber: 1400002,
                creationTime: 1506473515,
                transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000A07",
                transactionIndex: 0,
                fullPrecisionAmount: 2,
                fullPrecisionPrice: 0.600001,
                orderState: "OPEN",
                owner: "0x0000000000000000000000000000000000000b0b",
                price: 0.6,
                shareToken: "0x1000000000000000000000000000000000000000",
                sharesEscrowed: 0,
                tokensEscrowed: 1.200002,
              },
            },
          },
        },
      });
    },
  });
  test({
    description: "get open orders for nonexistent market",
    params: {
      universe: "0x000000000000000000000000000000000000000b",
      marketID: "0x1010101010101010101010101010101010101010",
      outcome: null,
      orderType: null,
      creator: null,
    },
    assertions: (err, openOrders) => {
      assert.isNull(err);
      assert.deepEqual(openOrders, {});
    },
  });
});
