---
id: api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams
title: NativePlaceTradeChainParams
sidebar_label: NativePlaceTradeChainParams
---

[@augurproject/sdk](api-readme.md) > [[augur-sdk/src/api/OnChainTrade Module]](api-modules-augur-sdk-src-api-onchaintrade-module.md) > [NativePlaceTradeChainParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md)

## Interface

## Hierarchy

 [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md)

**↳ NativePlaceTradeChainParams**

↳  [ZeroXPlaceTradeParams](api-interfaces-augur-sdk-src-api-zerox-zeroxplacetradeparams.md)

↳  [PlaceTradeParams](api-interfaces-augur-sdk-src-api-trade-placetradeparams.md)

### Properties

* [amount](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#amount)
* [direction](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#direction)
* [doNotCreateOrders](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#donotcreateorders)
* [fingerprint](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#fingerprint)
* [kycToken](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#kyctoken)
* [market](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#market)
* [numOutcomes](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#numoutcomes)
* [numTicks](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#numticks)
* [outcome](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#outcome)
* [price](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#price)
* [shares](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#shares)
* [tradeGroupId](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradechainparams.md#tradegroupid)

---

## Properties

<a id="amount"></a>

###  amount

**● amount**: *`BigNumber`*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:34](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L34)*

___
<a id="direction"></a>

###  direction

**● direction**: *`0` \| `1`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[direction](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#direction)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:14](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L14)*

___
<a id="donotcreateorders"></a>

###  doNotCreateOrders

**● doNotCreateOrders**: *`boolean`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[doNotCreateOrders](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#donotcreateorders)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:22](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L22)*

___
<a id="fingerprint"></a>

###  fingerprint

**● fingerprint**: *`string`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[fingerprint](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#fingerprint)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:20](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L20)*

___
<a id="kyctoken"></a>

###  kycToken

**● kycToken**: *`string`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[kycToken](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#kyctoken)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:21](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L21)*

___
<a id="market"></a>

###  market

**● market**: *`string`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[market](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#market)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:15](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L15)*

___
<a id="numoutcomes"></a>

###  numOutcomes

**● numOutcomes**: *`3` \| `4` \| `5` \| `6` \| `7` \| `8`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[numOutcomes](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#numoutcomes)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:17](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L17)*

___
<a id="numticks"></a>

###  numTicks

**● numTicks**: *`BigNumber`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[numTicks](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#numticks)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:16](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L16)*

___
<a id="outcome"></a>

###  outcome

**● outcome**: *`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[outcome](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#outcome)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:18](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L18)*

___
<a id="price"></a>

###  price

**● price**: *`BigNumber`*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:35](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L35)*

___
<a id="shares"></a>

###  shares

**● shares**: *`BigNumber`*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:36](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L36)*

___
<a id="tradegroupid"></a>

###  tradeGroupId

**● tradeGroupId**: *`string`*

*Inherited from [NativePlaceTradeParams](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md).[tradeGroupId](api-interfaces-augur-sdk-src-api-onchaintrade-nativeplacetradeparams.md#tradegroupid)*

*Defined in [augur-sdk/src/api/OnChainTrade.ts:19](https://github.com/AugurProject/augur/blob/1e1466f1d3/packages/augur-sdk/src/api/OnChainTrade.ts#L19)*

___

