import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { readFile } from 'async-file';
import { CompilerOutput } from 'solc';
import { DeployerConfiguration } from './DeployerConfiguration';
import { Augur, AugurTrading, } from './ContractInterfaces';
import { Contracts } from './Contracts';
import { Dependencies, Contract, AbiFunction } from '../libraries/GenericContractInterfaces';
import { stringTo32ByteHex } from './HelperFunctions';
import { REGISTERED_INTERNAL_CONTRACTS, TRADING_CONTRACTS, REGISTERED_EXTERNAL_CONTRACTS, INITIALIZED_CONTRACTS } from './constants';
import { ContractAddresses } from '@augurproject/artifacts/build';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const SUCCESS = "";

const TEST_SUBSTITUTES = [
    "ReputationTokenFactory",
]

export class DeploymentVerifier {
    private readonly configuration: DeployerConfiguration;
    private readonly contracts: Contracts;
    private readonly dependencies: Dependencies<BigNumber>
    private readonly provider: ethers.providers.JsonRpcProvider;
    private readonly addresses: ContractAddresses;
    private readonly augur: Augur;
    private readonly augurTrading: AugurTrading;

    static verifyDeployment = async (contractAddresses: ContractAddresses, dependencies: Dependencies<BigNumber>, provider: ethers.providers.JsonRpcProvider, deployerConfiguration: DeployerConfiguration): Promise<string> => {
        const compilerOutput = JSON.parse(await readFile(deployerConfiguration.contractInputPath, 'utf8'));
        const verifier = new DeploymentVerifier(contractAddresses, deployerConfiguration, dependencies, provider, compilerOutput);
        return await verifier.doVerification();
    }

    constructor(contractAddresses: ContractAddresses, configuration: DeployerConfiguration, dependencies: Dependencies<BigNumber>, provider: ethers.providers.JsonRpcProvider, compilerOutput: CompilerOutput) {
        this.addresses = contractAddresses;
        this.augur = new Augur(dependencies, contractAddresses.Augur);
        this.augurTrading = new AugurTrading(dependencies, contractAddresses.AugurTrading);
        this.configuration = configuration;
        this.dependencies = dependencies;
        this.provider = provider;
        this.contracts = new Contracts(compilerOutput);
    }

    async doVerification(): Promise<string> {
        let error = await this.verifyDeploymentIsOver();
        if (error) return error;

        error = await this.verifyInternalContracts();
        if (error) return error;

        error = await this.verifyExternalAddresses();
        if (error) return error;

        error = await this.verifyInitializations();
if (error) return error;

        error = await this.verifyAugurTradingInitialization();
        
        return error;
    }

    // Verify deployment is ended for Augur and Augur Trading
    async verifyDeploymentIsOver(): Promise<string> {
        const augurUploader = await this.augur.uploader_();
        const augurTradingUploader = await this.augurTrading.uploader_();

        if (augurUploader !== NULL_ADDRESS) return "DEPLOYMENT NOT FINISHED FOR AUGUR";
        if (augurTradingUploader !== NULL_ADDRESS) return "DEPLOYMENT NOT FINISHED FOR AUGUR TRADING";
        return SUCCESS;
    }

    async getContractAddress(name: string): Promise<string> {
        const registryName = stringTo32ByteHex(name);
        if (TRADING_CONTRACTS.includes(name)) {
            return await this.augurTrading.lookup_(registryName);
        }
        return await this.augur.lookup_(registryName);
    }

    // Verify bytecode of all internal registered contracts
    async verifyInternalContracts(): Promise<string> {
        for (const name of REGISTERED_INTERNAL_CONTRACTS) {
            const contractData = this.contracts.get(name);
            const expectedByteCode = contractData.bytecode.toString("hex");
            const registeredAddress = await this.getContractAddress(name);
            if (registeredAddress === NULL_ADDRESS) return `CONTRACT ${name} NOT FOUND IN REGSISTRY`;
            const expectedAddress = this.addresses[name];
            if (this.addresses[name] && registeredAddress !== expectedAddress) return `CONTRACT ${name} HAS DIFFERENT ADDRESS ${registeredAddress} THAN EXPECTED ${expectedAddress}`;
            let actualByteCode = await this.provider.getCode(registeredAddress);
            actualByteCode = actualByteCode.slice(2);
            if (!expectedByteCode.endsWith(actualByteCode)) return `CONTRACT ${name} HAS INCORRECT BYTECODE`;
        }
        return SUCCESS;
    }

    // Verify addresses of all external registered contracts
    async verifyExternalAddresses(): Promise<string> {
        for (const name of REGISTERED_EXTERNAL_CONTRACTS) {
            const expectedAddress = this.configuration.externalAddresses[name];
            // If an external address wasn't specified it means we're uploading a test version and this is verifying a test network, so don't bother verifying this
            if (!expectedAddress) {
                console.warn(`SKIPPING VERIFICATION OF ${name} AS NO EXPECTED ADDRESS FOUND. SHOULD NOT HAPPEN IN PROD`);
                continue;
            };
            const registeredAddress = await this.getContractAddress(name);
            if (expectedAddress !== registeredAddress) return `CONTRACT ${name} HAS INCORRECT ADDRESS REGISTERED`;
        }
        return SUCCESS;
    }

    // Verify all initializable contracts are initialized
    async verifyInitializations(): Promise<string> {
        for (const name of INITIALIZED_CONTRACTS) {
            const contract = new Initializable(this.dependencies, this.addresses[name]);
            console.log(`Verifying initialization of ${name} at ${contract.address}`);
            const initialized = await contract.getInitialized_();
            if (!initialized) return `CONTRACT ${name} was not initialized`;
            const augurRef = await contract.augur_();
            if (augurRef !== this.augur.address) return `CONTRACT ${name} HAD BAD AUGUR REF ${augurRef}`;
            if (TRADING_CONTRACTS.includes(name)) {
                const augurTradingRef = await contract.augurTrading_();
                if (augurTradingRef !== this.augurTrading.address) return `CONTRACT ${name} HAD BAD AUGUR TRADING REF ${augurTradingRef}`;
            }
        }
        return SUCCESS;
    }

    async verifyAugurTradingInitialization(): Promise<string> {
        const augurTradingAugurAddress = await this.augurTrading.augur_();
        if (augurTradingAugurAddress !== this.augur.address) return `AugurTrading has Augur at ${augurTradingAugurAddress}. Expected: ${this.augur.address}`;
        return SUCCESS;
    }
}

export class Initializable extends Contract<BigNumber> {
    public constructor(dependencies: Dependencies<BigNumber>, address: string) {
		super(dependencies, address)
    }
    
    public getInitialized_ = async (options?: { sender?: string }): Promise<boolean> => {
		options = options || {}
		const abi: AbiFunction = {"constant":true,"inputs":[],"name":"getInitialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}
		const result = await this.localCall(abi, [], options.sender)
		return <boolean>result[0]
    }
    
    public augur_ = async (options?: { sender?: string }): Promise<string> => {
		options = options || {}
		const abi: AbiFunction = {"constant":true,"inputs":[],"name":"augur","outputs":[{"internalType":"contract IAugur","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}
		const result = await this.localCall(abi, [], options.sender)
		return <string>result[0]
    }
    
    public augurTrading_ = async (options?: { sender?: string }): Promise<string> => {
		options = options || {}
		const abi: AbiFunction = {"constant":true,"inputs":[],"name":"augurTrading","outputs":[{"internalType":"contract IAugurTrading","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}
		const result = await this.localCall(abi, [], options.sender)
		return <string>result[0]
	}
}
