import { ProviderEvent, ProviderEventData, ProviderMethod, ProviderApiResponse, RawProviderEventData, RawProviderRequest, RawProviderApiRequestParams, RawProviderApiResponse, ProviderApiRequestParams } from './api';
import { MergeInputObjectsArray, MergeOutputObjectsArray, ReadonlyAbiParam } from './models';
import { Address } from './utils';
import { Subscriber } from './stream';
import { Contract } from './contract';
export * from './api';
export * from './models';
export { Contract, TvmException, ContractMethod } from './contract';
export { Stream, Subscriber } from './stream';
export { Address, AddressLiteral, mergeTransactions } from './utils';
/**
 * @category Provider
 */
export interface Provider {
    request<T extends ProviderMethod>(data: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;
    addListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    removeListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    on<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    once<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    prependListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
    prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
}
/**
 * @category Provider
 */
export declare function hasTonProvider(): Promise<boolean>;
/**
 * @category Provider
 */
export declare class ProviderRpcClient {
    private readonly _api;
    private readonly _initializationPromise;
    private readonly _subscriptions;
    private readonly _contractSubscriptions;
    private _ton?;
    constructor();
    /**
     * Checks whether ton provider exists.
     */
    hasProvider(): Promise<boolean>;
    /**
     * Waits until provider api will be available.
     *
     * @throws ProviderNotFoundException when no provider found
     */
    ensureInitialized(): Promise<void>;
    /**
     * Whether provider api is ready
     */
    get isInitialized(): boolean;
    /**
     * Raw provider
     */
    get raw(): Provider;
    /**
     * Raw provider api
     */
    get rawApi(): RawProviderApiMethods;
    /**
     * Creates typed contract wrapper.
     *
     * @param abi Readonly object (must be declared with `as const`)
     * @param address Default contract address
     */
    createContract<Abi>(abi: Abi, address: Address): Contract<Abi>;
    /**
     * Creates subscriptions group
     */
    createSubscriber(): Subscriber;
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    requestPermissions(args: ProviderApiRequestParams<'requestPermissions'>): Promise<ProviderApiResponse<'requestPermissions'>>;
    /**
     * Removes all permissions for current origin and stops all subscriptions
     */
    disconnect(): Promise<void>;
    /**
     * Called every time contract state changes
     */
    subscribe(eventName: 'contractStateChanged', params: {
        address: Address;
    }): Promise<Subscription<'contractStateChanged'>>;
    /**
     * Called on each new transactions batch, received on subscription
     */
    subscribe(eventName: 'transactionsFound', params: {
        address: Address;
    }): Promise<Subscription<'transactionsFound'>>;
    /**
     * Called when inpage provider disconnects from extension
     */
    subscribe(eventName: 'disconnected'): Promise<Subscription<'disconnected'>>;
    /**
     * Called each time the user changes network
     */
    subscribe(eventName: 'networkChanged'): Promise<Subscription<'networkChanged'>>;
    /**
     * Called when permissions are changed.
     * Mostly when account has been removed from the current `accountInteraction` permission,
     * or disconnect method was called
     */
    subscribe(eventName: 'permissionsChanged'): Promise<Subscription<'permissionsChanged'>>;
    /**
     * Called when the user logs out of the extension
     */
    subscribe(eventName: 'loggedOut'): Promise<Subscription<'loggedOut'>>;
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    getProviderState(): Promise<ProviderApiResponse<'getProviderState'>>;
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `tonClient`
     */
    getFullContractState(args: ProviderApiRequestParams<'getFullContractState'>): Promise<ProviderApiResponse<'getFullContractState'>>;
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `tonClient`
     */
    getTransactions(args: ProviderApiRequestParams<'getTransactions'>): Promise<ProviderApiResponse<'getTransactions'>>;
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `tonClient`
     */
    getExpectedAddress<Abi>(abi: Abi, args: GetExpectedAddressParams<Abi>): Promise<Address>;
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    packIntoCell<P extends readonly ReadonlyAbiParam[]>(args: {
        structure: P;
        data: MergeInputObjectsArray<P>;
    }): Promise<ProviderApiResponse<'packIntoCell'>>;
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    unpackFromCell<P extends readonly ReadonlyAbiParam[]>(args: {
        structure: P;
        boc: string;
        allowPartial: boolean;
    }): Promise<{
        data: MergeOutputObjectsArray<P>;
    }>;
    /**
     * Extracts public key from raw account state
     *
     * NOTE: can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `tonClient`
     */
    extractPublicKey(boc: string): Promise<string>;
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `tonClient`
     */
    codeToTvc(code: string): Promise<string>;
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `tonClient`
     */
    splitTvc(tvc: string): Promise<ProviderApiResponse<'splitTvc'>>;
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    sendMessage(args: ProviderApiRequestParams<'sendMessage'>): Promise<ProviderApiResponse<'sendMessage'>>;
    private _getEventSubscriptions;
}
/**
 * @category Provider
 */
export interface Subscription<T extends ProviderEvent> {
    /**
     * Fires on each incoming event with the event object as argument.
     *
     * @param eventName 'data'
     * @param listener
     */
    on(eventName: 'data', listener: (data: ProviderEventData<T>) => void): this;
    /**
     * Fires on successful re-subscription
     *
     * @param eventName 'subscribed'
     * @param listener
     */
    on(eventName: 'subscribed', listener: () => void): this;
    /**
     * Fires on unsubscription
     *
     * @param eventName 'unsubscribed'
     * @param listener
     */
    on(eventName: 'unsubscribed', listener: () => void): this;
    /**
     * Can be used to re-subscribe with the same parameters.
     */
    subscribe(): Promise<void>;
    /**
     * Unsubscribes the subscription.
     */
    unsubscribe(): Promise<void>;
}
/**
 * @category Provider
 */
export declare class ProviderNotFoundException extends Error {
    constructor();
}
/**
 * @category Provider
 */
export declare type RawRpcMethod<P extends ProviderMethod> = RawProviderApiRequestParams<P> extends {} ? (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>> : () => Promise<RawProviderApiResponse<P>>;
declare type RawProviderApiMethods = {
    [P in ProviderMethod]: RawRpcMethod<P>;
};
/**
 * @category Provider
 */
export declare type GetExpectedAddressParams<Abi> = Abi extends {
    data: infer D;
} ? {
    /**
     * Base64 encoded TVC file
     */
    tvc: string;
    /**
     * Contract workchain. 0 by default
     */
    workchain?: number;
    /**
     * Public key, which will be injected into the contract. 0 by default
     */
    publicKey?: string;
    /**
     * State init params
     */
    initParams: MergeInputObjectsArray<D>;
} : never;
declare const provider: ProviderRpcClient;
/**
 * @category Provider
 */
export default provider;
