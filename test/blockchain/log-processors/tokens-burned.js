"use strict";

const assert = require("chai").assert;
const setupTestDb = require("../../test.database");
const { processBurnLog, processBurnLogRemoval } = require("../../../build/blockchain/log-processors/token/burn");

describe("blockchain/log-processors/tokens-burned", () => {
  const test = (t) => {
    const getTokenBalances = (db, params, callback) => db.select(["balances.owner", "balances.token", "balances.balance", "token_supply.supply"]).from("balances").join("token_supply", "balances.token", "token_supply.token").where("balances.token", params.log.token).asCallback(callback);
    it(t.description, (done) => {
      setupTestDb((err, db) => {
        assert.isNull(err);
        db.transaction((trx) => {
          processBurnLog(trx, t.params.augur, t.params.log, (err) => {
            assert.isNull(err);
            getTokenBalances(trx, t.params, (err, records) => {
              t.assertions.onAdded(err, records);
              processBurnLogRemoval(trx, t.params.augur, t.params.log, (err) => {
                assert.isNull(err);
                getTokenBalances(trx, t.params, (err, records) => {
                  t.assertions.onRemoved(err, records);
                  done();
                });
              });
            });
          });
        });
      });
    });
  };
  test({
    description: "Tokens burned",
    params: {
      log: {
        transactionHash: "TRANSACTION_HASH",
        logIndex: 0,
        blockNumber: 1400101,
        target: "FROM_ADDRESS",
        token: "TOKEN_ADDRESS",
        amount: 9000,
      },
      augur: {},
    },
    assertions: {
      onAdded: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, [{
          owner: "FROM_ADDRESS",
          token: "TOKEN_ADDRESS",
          balance: 1,
          supply: 1,
        }]);
      },
      onRemoved: (err, records) => {
        assert.isNull(err);
        assert.deepEqual(records, [{
          owner: "FROM_ADDRESS",
          token: "TOKEN_ADDRESS",
          balance: 9001,
          supply: 9001,
        }]);
      },
    },
  });
});
