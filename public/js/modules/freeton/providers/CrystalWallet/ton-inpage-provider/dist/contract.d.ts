import { Address, UniqueArray } from './utils';
import { FullContractState, Transaction, AbiFunctionName, AbiEventName, AbiFunctionInputs, DecodedAbiFunctionOutputs, DecodedAbiFunctionInputs, DecodedAbiEventData } from './models';
/**
 * @category Contract
 */
export declare class Contract<Abi> {
    private readonly _abi;
    private readonly _functions;
    private readonly _events;
    private readonly _address;
    private readonly _methods;
    constructor(abi: Abi, address: Address);
    get methods(): ContractMethods<Abi>;
    get address(): Address;
    get abi(): string;
    decodeTransaction(args: DecodeTransactionParams<Abi>): Promise<DecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined>;
    decodeTransactionEvents(args: DecodeTransactionEventsParams): Promise<DecodedEvent<Abi, AbiEventName<Abi>>[]>;
    decodeInputMessage(args: DecodeInputParams<Abi>): Promise<DecodedInput<Abi, AbiFunctionName<Abi>> | undefined>;
    decodeOutputMessage(args: DecodeOutputParams<Abi>): Promise<DecodedOutput<Abi, AbiFunctionName<Abi>> | undefined>;
}
/**
 * @category Contract
 */
export declare class TvmException extends Error {
    readonly code: number;
    constructor(code: number);
}
/**
 * @category Contract
 */
export interface ContractMethod<I, O> {
    /**
     * Target contract address
     */
    readonly address: Address;
    readonly abi: string;
    readonly method: string;
    readonly params: I;
    /**
     * Sends internal message and returns wallet transactions
     *
     * @param args
     */
    send(args: SendInternalParams): Promise<Transaction>;
    /**
     * Estimates wallet fee for calling this method as an internal message
     */
    estimateFees(args: SendInternalParams): Promise<string>;
    /**
     * Sends external message and returns contract transaction with parsed output
     *
     * @param args
     */
    sendExternal(args: SendExternalParams): Promise<{
        transaction: Transaction;
        output?: O;
    }>;
    /**
     * Runs message locally
     */
    call(args?: CallParams): Promise<O>;
}
declare type ContractMethods<C> = {
    [K in AbiFunctionName<C>]: (params: AbiFunctionInputs<C, K>) => ContractMethod<AbiFunctionInputs<C, K>, DecodedAbiFunctionOutputs<C, K>>;
};
export declare type SendInternalParams = {
    from: Address;
    amount: string;
    /**
     * @default true
     */
    bounce?: boolean;
};
export declare type SendExternalParams = {
    publicKey: string;
    stateInit?: string;
};
export declare type CallParams = {
    cachedState?: FullContractState;
};
export declare type DecodeTransactionParams<Abi> = {
    transaction: Transaction;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
};
export declare type DecodedTransaction<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    input: DecodedAbiFunctionInputs<Abi, T>;
    output: DecodedAbiFunctionOutputs<Abi, T>;
} : never;
export declare type DecodeInputParams<Abi> = {
    body: string;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
    internal: boolean;
};
export declare type DecodedInput<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    input: DecodedAbiFunctionInputs<Abi, T>;
} : never;
export declare type DecodeOutputParams<Abi> = {
    body: string;
    methods: UniqueArray<AbiFunctionName<Abi>[]>;
};
export declare type DecodedOutput<Abi, T> = T extends AbiFunctionName<Abi> ? {
    method: T;
    output: DecodedAbiFunctionOutputs<Abi, T>;
} : never;
export declare type DecodeTransactionEventsParams = {
    transaction: Transaction;
};
export declare type DecodedEvent<Abi, T> = T extends AbiEventName<Abi> ? {
    event: T;
    data: DecodedAbiEventData<Abi, T>;
} : never;
export {};
