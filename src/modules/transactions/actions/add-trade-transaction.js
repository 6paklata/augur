import { formatEther } from '../../../utils/format-number';
import {
	MULTI_TRADE,
	BUY_SHARES,
	SELL_SHARES,
// BID_SHARES,
// ASK_SHARES
} from '../../transactions/constants/types';
import { updateExistingTransaction } from '../../transactions/actions/update-existing-transaction';
import { multiTrade } from '../../trade/actions/place-trade';
import { addTransaction } from '../../transactions/actions/add-transactions';

export const makeTradeTransaction =
(isSell, market, outcome, numShares, limitPrice, totalCostWithoutFeeEther, feeEther, gas, dispatch) => {
	return {
		type: !isSell ? BUY_SHARES : SELL_SHARES,
		shares: numShares,
		limitPrice: limitPrice,
		ether: totalCostWithoutFeeEther + feeEther,
		gas,
		data: {
			marketID: market.id,
			outcomeID: outcome.id,
			marketDescription: market.description,
			outcomeName: outcome.name,
			avgPrice: formatEther(totalCostWithoutFeeEther / numShares),
			feeToPay: formatEther(feeEther)
		},
		action: (transactionID) => {
			// todo: what to do here?
			dispatch(updateExistingTransaction({
				[transactionID]: { status: 'sending...' }
			}));
		}
	};
};

export function makeMultiTradeTransaction(marketId, dispatch) {
	return {
		type: MULTI_TRADE,
		data: {
			marketID: marketId
		},
		action: (transactionID) => {
			dispatch(multiTrade(transactionID, marketId));
		}
	};
}

export const addTradeTransaction =
(isSell, market, outcome, numShares, totalCostWithoutFeeEther, feeEther, gas) =>
  (dispatch, getState) =>
    dispatch(
			addTransaction(
				makeTradeTransaction(
					isSell, market, outcome,
					numShares, totalCostWithoutFeeEther, feeEther,
					gas, dispatch
				)
			)
		);
