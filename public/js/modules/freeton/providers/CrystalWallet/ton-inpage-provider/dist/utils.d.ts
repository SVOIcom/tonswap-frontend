import { Transaction, TransactionsBatchInfo } from './models';
/**
 * @category Utils
 */
export declare type UniqueArray<T> = T extends readonly [infer X, ...infer Rest] ? InArray<Rest, X> extends true ? ['Encountered value with duplicates:', X] : readonly [X, ...UniqueArray<Rest>] : T;
/**
 * @category Utils
 */
export declare type InArray<T, X> = T extends readonly [X, ...infer _Rest] ? true : T extends readonly [X] ? true : T extends readonly [infer _, ...infer Rest] ? InArray<Rest, X> : false;
/**
 * @category Utils
 */
export declare type ArrayItemType<T extends readonly unknown[]> = T extends readonly (infer Ts)[] ? Ts : never;
/**
 * @category Utils
 */
export declare class Address {
    private readonly _address;
    constructor(address: string);
    toString(): string;
    equals(other: Address | string): boolean;
}
/**
 * @category Utils
 */
export declare class AddressLiteral<T extends string> extends Address {
    constructor(address: CheckAddress<T>);
}
declare type CheckAddress<T extends string> = AddressImpl<T, Lowercase<T>>;
declare type AddressPrefix = '0:' | '-1:';
declare type AddressImpl<T, Tl extends string> = Tl extends `${AddressPrefix}${infer Hash}` ? true extends IsHexString<Hash, []> ? T : never : never;
declare type HexSymbol = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
declare type HexByte = `${HexSymbol}${HexSymbol}`;
declare type IsHexString<T extends string, L extends readonly number[]> = T extends `${HexByte}${infer Tail}` ? IsHexString<Tail, [...L, 0]> : T extends '' ? L['length'] extends 32 ? true : never : never;
/**
 * Modifies knownTransactions array, merging it with new transactions.
 * All arrays are assumed to be sorted by descending logical time.
 *
 * > Note! This method does not remove duplicates.
 *
 * @param knownTransactions
 * @param newTransactions
 * @param info
 *
 * @category Utils
 */
export declare function mergeTransactions<Addr>(knownTransactions: Transaction<Addr>[], newTransactions: Transaction<Addr>[], info: TransactionsBatchInfo): Transaction<Addr>[];
export declare function getUniqueId(): number;
export {};
