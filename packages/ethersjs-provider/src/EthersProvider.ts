import { NetworkId } from '@augurproject/artifacts';
import { Filter, Log, LogValues } from '@augurproject/types';
import { Transaction } from 'contract-dependencies';
import { EthersProvider as EProvider } from 'contract-dependencies-ethers';
import { ethers } from 'ethers';
import { Abi } from 'ethereum';
import * as _ from 'lodash';
import { AsyncQueue, queue, retry } from 'async';
import { isInstanceOfBigNumber, isInstanceOfArray } from './utils';
import { JSONRPCRequestPayload } from 'ethereum-types';
import { BigNumber } from "bignumber.js";

interface ContractMapping {
  [contractName: string]: ethers.utils.Interface;
}

interface PerformQueueTask {
  message: any;
  params: any;
}

export class EthersProvider extends ethers.providers.BaseProvider
  implements EProvider {
  gasLimit: ethers.utils.BigNumber | null = new ethers.utils.BigNumber(7500000);
  gasEstimateIncreasePercentage: BigNumber | null = new BigNumber(34);
  private contractMapping: ContractMapping = {};
  private performQueue: AsyncQueue<PerformQueueTask>;
  readonly provider: ethers.providers.JsonRpcProvider;

  private _overrideGasPrice: ethers.utils.BigNumber | null = null;
  get overrideGasPrice() {
    return this._overrideGasPrice;
  }

  set overrideGasPrice(gasPrice: ethers.utils.BigNumber | null) {
    if (gasPrice !== null && gasPrice.eq(new ethers.utils.BigNumber(0))) {
      this._overrideGasPrice = null;
    } else {
      this._overrideGasPrice = gasPrice;
    }
  }

  private;

  constructor(
    provider: ethers.providers.JsonRpcProvider,
    times: number,
    interval: number,
    concurrency: number
  ) {
    super(provider.getNetwork());
    this.provider = provider;
    this.performQueue = queue(
      (item: PerformQueueTask, callback: (err: Error, results: any) => void) => {
        const _this = this;
        retry(
          { times, interval },
          async () => {
            return await _this.provider.perform(item.message, item.params);
          },
          callback
        );
      },
      concurrency
    );
  }

  async listAccounts(): Promise<string[]> {
    return this.provider.listAccounts();
  }

  async call(
    transaction: Transaction<ethers.utils.BigNumber>
  ): Promise<string> {
    const txRequest: ethers.providers.TransactionRequest = transaction;
    return super.call(txRequest);
  }

  async getNetworkId(): Promise<NetworkId> {
    return (await this.getNetwork()).chainId.toString() as NetworkId;
  }

  async getBlockNumber(): Promise<number> {
    return super.getBlockNumber();
  }

  async getGasPrice(): Promise<ethers.utils.BigNumber> {
    if (this.overrideGasPrice !== null) {
      return this.overrideGasPrice;
    }
    return super.getGasPrice();
  }

  async estimateGas(
    transaction: ethers.providers.TransactionRequest
  ): Promise<ethers.utils.BigNumber> {
    let gasEstimate = new BigNumber((await super.estimateGas(transaction)).toString());
    if (this.gasEstimateIncreasePercentage) {
      gasEstimate = this.gasEstimateIncreasePercentage
        .div(100)
        .plus(1)
        .times(gasEstimate)
        .idiv(1);
    }

    if (this.gasLimit) {
      gasEstimate = gasEstimate.gt(this.gasLimit.toString()) ? new BigNumber(this.gasLimit.toString()) : gasEstimate;
    }

    return new ethers.utils.BigNumber(gasEstimate.toFixed());
  }

  storeAbiData(abi: Abi, contractName: string): void {
    this.contractMapping[contractName] = new ethers.utils.Interface(abi);
  }

  async getEthBalance(address: string): Promise<string> {
    const result = await super.getBalance(address);
    return result.toString();
  }

  getEventTopic(contractName: string, eventName: string): string {
    const contractInterface = this.getContractInterface(contractName);
    if (contractInterface.events[eventName] === undefined) {
      throw new Error(
        `Contract name ${contractName} did not have event ${eventName}`
      );
    }
    return contractInterface.events[eventName].topic;
  }

  encodeContractFunction(
    contractName: string,
    functionName: string,
    funcParams: any[]
  ): string {
    const contractInterface = this.getContractInterface(contractName);
    const func = contractInterface.functions[functionName];
    if (func === undefined) {
      throw new Error(
        `Contract name ${contractName} did not have function ${functionName}`
      );
    }
    const ethersParams = _.map(funcParams, param => {
      if (isInstanceOfBigNumber(param)) {
        return new ethers.utils.BigNumber(param.toFixed());
      } else if (
        isInstanceOfArray(param) &&
        param.length > 0 &&
        isInstanceOfBigNumber(param[0])
      ) {
        return _.map(
          param,
          value => new ethers.utils.BigNumber(value.toFixed())
        );
      }
      return param;
    });
    return func.encode(ethersParams);
  }

  parseLogValues(contractName: string, log: Log): LogValues {
    const contractInterface = this.getContractInterface(contractName);
    const parsedLog = contractInterface.parseLog(log);
    const omittedValues = _.map(_.range(parsedLog.values.length), n =>
      n.toString()
    );
    omittedValues.push('length');
    const logValues = _.omit(parsedLog.values, omittedValues);
    return {
      name: parsedLog.name,
      ..._.mapValues(logValues, (val: any) => {
        if (val._hex) {
          return val._hex;
        } else if (Array.isArray(val)) {
          val = _.map(val, innerVal => {
            if (innerVal._hex) {
              return innerVal._hex;
            }
            return innerVal;
          });
        }
        return val;
      }),
    };
  }

  private getContractInterface(contractName: string): ethers.utils.Interface {
    const contractInterface = this.contractMapping[contractName];
    if (!contractInterface) {
      throw new Error(
        `Contract name ${contractName} not found in EthersJSProvider. Call 'storeAbiData' first with this name and the contract abi`
      );
    }
    return contractInterface;
  }

  private async _getLogs(filter: Filter): Promise<ethers.providers.Log[]> {
    try {
      return await super.getLogs(filter);
    } catch (e) {
      // Check if infura log limit error.
      // See https://infura.io/docs/ethereum/json-rpc/eth_getLogs.
      if (e.code !== -32005) {
        throw e;
      }

      // bisect the block window.
      const midBlock = Math.floor(
        (Number(filter.toBlock) + Number(filter.fromBlock)) / 2
      );

      // Presumably we would never have more than 10k logs in one block but just in case.
      if (Number(filter.fromBlock) === midBlock) throw e;

      return [
        ...(await this._getLogs({
          ...filter,
          toBlock: midBlock,
        })),
        ...(await this._getLogs({
          ...filter,
          fromBlock: midBlock + 1,
        })),
      ];
    }
  }

  getLogs = async (filter: Filter): Promise<Log[]> => {
    const logs = await this._getLogs(filter);
    return logs.map<Log>(log => ({
      name: '',
      transactionHash: '',
      blockNumber: 0,
      blockHash: '',
      logIndex: 0,
      transactionIndex: 0,
      transactionLogIndex: 0,
      removed: false,
      ...log,
    }));
  }

  // This is to support the 0x Provider Engine requirements
  async sendAsync(payload: JSONRPCRequestPayload): Promise<any> {
    return this.provider.send(payload.method, payload.params);
  }

  async perform(message: any, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.performQueue.push({ message, params }, (err, results) => {
        if (err) {
          reject(err);
        }
          resolve(results);
      });
    });
  }

  disconnect(): void {}
}
