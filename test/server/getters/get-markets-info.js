"use strict";

const assert = require("chai").assert;
const setupTestDb = require("../../test.database");
const { getMarketsInfo } = require("../../../build/server/getters/get-markets-info");


describe("server/getters/get-markets-info", () => {
  const test = (t) => {
    it(t.description, (done) => {
      setupTestDb((err, db) => {
        if (err) assert.fail(err);
        getMarketsInfo(db, t.params.marketIDs, (err, marketsInfo) => {
          t.assertions(err, marketsInfo);
          done();
        });
      });
    });
  };
  test({
    description: "get markets by specifying market IDs",
    params: {
      marketIDs: [
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000002",
      ],
    },
    assertions: (err, marketsInfo) => {
      assert.isNull(err);
      assert.deepEqual(marketsInfo, [
        {
          id: "0x0000000000000000000000000000000000000001",
          universe: "0x000000000000000000000000000000000000000b",
          type: "categorical",
          numOutcomes: 8,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506473474,
          creationBlock: 1400000,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573470,
          finalizationTime: null,
          description: "This is a categorical test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 100,
            price: 0.125,
            description: "outcome 0",
          }, {
            id: 1,
            volume: 100,
            price: 0.125,
            description: "outcome 1",
          }, {
            id: 2,
            volume: 100,
            price: 0.125,
            description: "outcome 2",
          }, {
            id: 3,
            volume: 100,
            price: 0.125,
            description: "outcome 3",
          }, {
            id: 4,
            volume: 100,
            price: 0.125,
            description: "outcome 4",
          }, {
            id: 5,
            volume: 100,
            price: 0.125,
            description: "outcome 5",
          }, {
            id: 6,
            volume: 100,
            price: 0.125,
            description: "outcome 6",
          }, {
            id: 7,
            volume: 100,
            price: 0.125,
            description: "outcome 7",
          }],
        },
        {
          id: "0x0000000000000000000000000000000000000002",
          universe: "0x000000000000000000000000000000000000000b",
          type: "binary",
          numOutcomes: 2,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506480000,
          creationBlock: 1400100,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573480,
          finalizationTime: null,
          description: "This is a binary test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 1000,
            price: 0.5,
            description: null,
          }, {
            id: 1,
            volume: 1000,
            price: 0.5,
            description: null,
          }],
        }]
      );
    },
  });
  test({
    description: "get markets by specifying market IDs, with missing market",
    params: {
      marketIDs: [
        "0x0000000000000000000000000000000000000001",
        "0x0000000000000000000000077777777777777777",
        "0x0000000000000000000000000000000000000002",
      ],
    },
    assertions: (err, marketsInfo) => {
      assert.isNull(err);
      assert.deepEqual(marketsInfo, [
        {
          id: "0x0000000000000000000000000000000000000001",
          universe: "0x000000000000000000000000000000000000000b",
          type: "categorical",
          numOutcomes: 8,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506473474,
          creationBlock: 1400000,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573470,
          finalizationTime: null,
          description: "This is a categorical test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 100,
            price: 0.125,
            description: "outcome 0",
          }, {
            id: 1,
            volume: 100,
            price: 0.125,
            description: "outcome 1",
          }, {
            id: 2,
            volume: 100,
            price: 0.125,
            description: "outcome 2",
          }, {
            id: 3,
            volume: 100,
            price: 0.125,
            description: "outcome 3",
          }, {
            id: 4,
            volume: 100,
            price: 0.125,
            description: "outcome 4",
          }, {
            id: 5,
            volume: 100,
            price: 0.125,
            description: "outcome 5",
          }, {
            id: 6,
            volume: 100,
            price: 0.125,
            description: "outcome 6",
          }, {
            id: 7,
            volume: 100,
            price: 0.125,
            description: "outcome 7",
          }],
        },
        null,
        {
          id: "0x0000000000000000000000000000000000000002",
          universe: "0x000000000000000000000000000000000000000b",
          type: "binary",
          numOutcomes: 2,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506480000,
          creationBlock: 1400100,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573480,
          finalizationTime: null,
          description: "This is a binary test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 1000,
            price: 0.5,
            description: null,
          }, {
            id: 1,
            volume: 1000,
            price: 0.5,
            description: null,
          }],
        }]
      );
    },
  });
  test({
    description: "get markets by specifying market IDs, reversed",
    params: {
      marketIDs: [
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000001",
      ],
    },
    assertions: (err, marketsInfo) => {
      assert.isNull(err);
      assert.deepEqual(marketsInfo, [
        {
          id: "0x0000000000000000000000000000000000000002",
          universe: "0x000000000000000000000000000000000000000b",
          type: "binary",
          numOutcomes: 2,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506480000,
          creationBlock: 1400100,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573480,
          finalizationTime: null,
          description: "This is a binary test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 1000,
            price: 0.5,
            description: null,
          }, {
            id: 1,
            volume: 1000,
            price: 0.5,
            description: null,
          }],
        },
        {
          id: "0x0000000000000000000000000000000000000001",
          universe: "0x000000000000000000000000000000000000000b",
          type: "categorical",
          numOutcomes: 8,
          minPrice: 0,
          maxPrice: 1,
          cumulativeScale: "1",
          author: "0x0000000000000000000000000000000000000b0b",
          creationTime: 1506473474,
          creationBlock: 1400000,
          creationFee: 10,
          reportingFeeRate: 0.02,
          marketCreatorFeeRate: 0.01,
          marketCreatorFeesCollected: 0,
          category: "test category",
          tags: ["test tag 1", "test tag 2"],
          volume: 0,
          outstandingShares: 0,
          reportingState: "DESIGNATED_REPORTING",
          reportingWindow: "0x1000000000000000000000000000000000000000",
          endDate: 1506573470,
          finalizationTime: null,
          description: "This is a categorical test market created by b0b.",
          extraInfo: null,
          designatedReporter: "0x0000000000000000000000000000000000000b0b",
          designatedReportStake: 10,
          resolutionSource: "http://www.trusted-third-party.com",
          numTicks: 10000,
          consensus: null,
          outcomes: [{
            id: 0,
            volume: 100,
            price: 0.125,
            description: "outcome 0",
          }, {
            id: 1,
            volume: 100,
            price: 0.125,
            description: "outcome 1",
          }, {
            id: 2,
            volume: 100,
            price: 0.125,
            description: "outcome 2",
          }, {
            id: 3,
            volume: 100,
            price: 0.125,
            description: "outcome 3",
          }, {
            id: 4,
            volume: 100,
            price: 0.125,
            description: "outcome 4",
          }, {
            id: 5,
            volume: 100,
            price: 0.125,
            description: "outcome 5",
          }, {
            id: 6,
            volume: 100,
            price: 0.125,
            description: "outcome 6",
          }, {
            id: 7,
            volume: 100,
            price: 0.125,
            description: "outcome 7",
          }],
        }]
      );
    },
  });
  test({
    description: "market does not exist",
    params: {
      marketIDs: ["0x1010101010101010101010101010101010101010"],
    },
    assertions: (err, marketInfo) => {
      assert.isNull(err);
      assert.deepEqual(marketInfo, [null]);
    },
  });
  test({
    description: "Empty marketIDs array",
    params: {
      marketIDs: [],
    },
    assertions: (err, marketInfo) => {
      assert.isNull(err);
      assert.deepEqual(marketInfo, []);
    },
  });
});
