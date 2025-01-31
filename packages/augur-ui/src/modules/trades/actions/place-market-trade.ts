import { createBigNumber } from "utils/create-big-number";
import {
  BUY, INVALID_OUTCOME_ID,
} from "modules/common/constants";
import logError from "utils/log-error";
import noop from "utils/noop";
import { AppState } from "store";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { placeTrade, approveToTrade } from "modules/contracts/actions/contractCalls";
import { Getters, TXEventName } from "@augurproject/sdk";
import { addPendingOrder, removePendingOrder, updatePendingOrderStatus } from "modules/orders/actions/pending-orders-management";
import { convertUnixToFormattedDate } from "utils/format-date";
import { generateTradeGroupId } from "utils/generate-trade-group-id";
import { getOutcomeNameWithOutcome } from "utils/get-outcome";

export const placeMarketTrade = ({
  marketId,
  outcomeId,
  tradeInProgress,
  doNotCreateOrders,
  callback = logError,
  onComplete = noop,
}: any) => async (dispatch: ThunkDispatch<void, any, Action>, getState: () => AppState) => {
  if (!marketId) return null;
  const { marketInfos, loginAccount, blockchain } = getState();
  const market: Getters.Markets.MarketInfo = marketInfos[marketId];
  if (!tradeInProgress || !market || outcomeId == null) {
    return console.error(
      `required parameters not found for market ${marketId} outcome ${outcomeId}`,
    );
  }

  const needsApproval = createBigNumber(loginAccount.allowance).lt(tradeInProgress.totalCost.value);
  if (needsApproval) await approveToTrade();
  // we need to make sure approvals went through before doing trade / the rest of this function
  const userShares = createBigNumber(tradeInProgress.shareCost || 0, 10);

  const displayPrice = tradeInProgress.limitPrice;
  const displayAmount = tradeInProgress.numShares;
  const orderType = tradeInProgress.side === BUY ? 0 : 1;
  const expirationTime = tradeInProgress.expirationTime ? createBigNumber(tradeInProgress.expirationTime) : undefined;

  const fingerprint = undefined; // TODO: get this from state
  const tradeGroupId = generateTradeGroupId();
  dispatch(addPendingOrder(
    {
      ...tradeInProgress,
      type: tradeInProgress.side,
      name: getOutcomeNameWithOutcome(market, outcomeId.toString(), outcomeId === INVALID_OUTCOME_ID),
      pending: true,
      fullPrecisionPrice: tradeInProgress.limitPrice,
      id: tradeGroupId,
      amount: tradeInProgress.numShares,
      status: TXEventName.Pending,
      creationTime: convertUnixToFormattedDate(
        blockchain.currentAugurTimestamp
      ),
    },
    market.id
  ));

  placeTrade(
    orderType,
    market.id,
    market.numOutcomes,
    parseInt(outcomeId, 10),
    fingerprint,
    doNotCreateOrders,
    market.numTicks,
    market.minPrice,
    market.maxPrice,
    displayAmount,
    displayPrice,
    userShares,
    expirationTime,
  ).then(() => {
    dispatch(removePendingOrder(tradeGroupId, market.id));
    callback(null, null)
  })
    .catch((err) => {
      console.log(err);
      dispatch(
        updatePendingOrderStatus(tradeGroupId, marketId, TXEventName.Failure, '0')
      );
      callback(err, null)
    });
};
