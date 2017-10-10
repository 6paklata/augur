import BigNumber from "bignumber.js";
import { PRECISION } from "../constants";

export function roundToPrecision(value: string|number, minimumValue: string|number, round?: string, roundingMode?: number): string {
  const bnValue: BigNumber = new BigNumber(value, 10);
  const bnMinimumValue: BigNumber = new BigNumber(minimumValue, 10);
  const bnAbsValue: BigNumber = bnValue.abs();
  if (bnAbsValue.lt(bnMinimumValue)) return "0";
  if (bnAbsValue.lt(PRECISION.limit)) return bnValue.toPrecision(PRECISION.decimals, roundingMode || BigNumber.ROUND_DOWN);
  if (round === "ceil") {
    return bnValue.times(PRECISION.multiple).ceil().dividedBy(PRECISION.multiple).toFixed();
  }
  return bnValue.times(PRECISION.multiple).floor().dividedBy(PRECISION.multiple).toFixed();
}
