"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getMarketInfo(db, marketId, callback) {
    db.get(`SELECT * FROM markets WHERE contract_address = ?`, [marketId], (err, row) => {
        if (err)
            return callback(err);
        if (!row)
            return callback(null);
        const marketInfo = {
            contractAddress: row.contract_address,
            universe: row.universe,
            marketType: row.market_type,
            numOutcomes: row.num_outcomes,
            minPrice: row.min_price,
            maxPrice: row.max_price,
            marketCreator: row.market_creator,
            creationTime: row.creation_time,
            creationBlockNumber: row.creation_block_number,
            creationFee: row.creation_fee,
            marketCreatorFeeRate: row.market_creator_fee_rate,
            marketCreatorFeesCollected: row.market_creator_fees_collected,
            topic: row.topic,
            tag1: row.tag1,
            tag2: row.tag2,
            volume: row.volume,
            sharesOutstanding: row.shares_outstanding,
            reportingWindow: row.reporting_window,
            endTime: row.end_time,
            finalizationTime: row.finalization_time,
            shortDescription: row.short_description,
            longDescription: row.long_description,
            designatedReporter: row.designated_reporter,
            resolutionSource: row.resolution_source
        };
        callback(null, marketInfo);
    });
}
exports.getMarketInfo = getMarketInfo;
//# sourceMappingURL=get-market-info.js.map