import { ProviderEventData } from './api';
import { Address } from './utils';
import { ProviderRpcClient } from './index';
/**
 * @category Stream
 */
export declare class Subscriber {
    private readonly ton;
    private readonly subscriptions;
    private readonly scanners;
    constructor(ton: ProviderRpcClient);
    /**
     * Returns stream of new transactions
     */
    transactions(address: Address): Stream<ProviderEventData<'transactionsFound'>>;
    /**
     * Returns stream of old transactions
     */
    oldTransactions(address: Address, filter?: {
        fromLt?: string;
        fromUtime?: number;
    }): Stream<ProviderEventData<'transactionsFound'>>;
    states(address: Address): Stream<ProviderEventData<'contractStateChanged'>>;
    unsubscribe(): Promise<void>;
    private _addSubscription;
}
/**
 * @category Stream
 */
export interface Stream<P, T = P> {
    readonly makeProducer: (onData: (event: P) => Promise<void>, onEnd: () => void) => void;
    readonly stopProducer: () => void;
    first(): Promise<T>;
    on(handler: (item: T) => void): void;
    merge(other: Stream<P, T>): Stream<P, T>;
    filter(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T>;
    filterMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U>;
    map<U>(f: (item: T) => (Promise<U> | U)): Stream<P, U>;
    flatMap<U>(f: (item: T) => (Promise<U[]> | U[])): Stream<P, U>;
    skip(n: number): Stream<P, T>;
    skipWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T>;
}
