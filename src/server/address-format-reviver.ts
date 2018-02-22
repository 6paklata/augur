/*
A reviver is a function that prescribes how the value originally produced by JSON.parse is transformed, before being returned.
*/

import { formatEthereumAddress } from "speedomatic";

export interface StringToBoolMap {
  [key: string]: boolean;
}

export const inputsExpectedAsAddress: StringToBoolMap = {
  account: true,
  creator: true,
  designatedReporter: true,
  marketId: true,
  marketIds: true,
  reporter: true,
  feeWindow: true,
  token: true,
  universe: true,
};

export function addressFormatReviver (key: string, value: any) {
  const valueIsOfAddressType: boolean = typeof value === "string" || Array.isArray(value);
  if (valueIsOfAddressType && inputsExpectedAsAddress[key] === true) {
    return formatEthereumAddress(value);
  }

  return value;
}
