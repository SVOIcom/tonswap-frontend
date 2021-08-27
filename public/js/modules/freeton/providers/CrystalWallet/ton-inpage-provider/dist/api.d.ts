import { ContractState, ContractUpdatesSubscription, FullContractState, Transaction, TransactionId, TransactionsBatchInfo, Permissions, Permission, FunctionCall, TokensObject, AbiParam } from './models';
import { UniqueArray, Address } from './utils';
/**
 * @category Provider Api
 */
export interface ProviderState<Addr = Address> {
    /**
     * Selected connection name (Mainnet / Testnet)
     */
    selectedConnection: string;
    /**
     * Object with active permissions attached data
     */
    permissions: Partial<Permissions<Addr>>;
    /**
     * Current subscription states
     */
    subscriptions: {
        [address: string]: ContractUpdatesSubscription;
    };
}
/**
 * @category Provider Api
 */
export declare type RawProviderState = ProviderState<string>;
/**
 * @category Provider Api
 */
export declare type ProviderEvents<Addr = Address> = {
    /**
     * Called when inpage provider disconnects from extension
     */
    disconnected: Error;
    /**
     * Called on each new transactions batch, received on subscription
     */
    transactionsFound: {
        /**
         * Contract address
         */
        address: Addr;
        /**
         * Guaranteed to be non-empty and ordered by descending lt
         */
        transactions: Transaction<Addr>[];
        /**
         * Describes transactions lt rage
         */
        info: TransactionsBatchInfo;
    };
    /**
     * Called every time contract state changes
     */
    contractStateChanged: {
        /**
         * Contract address
         */
        address: Addr;
        /**
         * New contract state
         */
        state: ContractState;
    };
    /**
     * Called each time the user changes network
     */
    networkChanged: {
        selectedConnection: string;
    };
    /**
     * Called when permissions are changed.
     * Mostly when account has been removed from the current `accountInteraction` permission,
     * or disconnect method was called
     */
    permissionsChanged: {
        permissions: Partial<Permissions<Addr>>;
    };
    /**
     * Called when the user logs out of the extension
     */
    loggedOut: {};
};
/**
 * @category Provider Api
 */
export declare type RawProviderEvents = ProviderEvents<string>;
/**
 * @category Provider Api
 */
export declare type ProviderApi<Addr = Address> = {
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    requestPermissions: {
        input: {
            permissions: UniqueArray<Permission[]>;
        };
        output: Partial<Permissions<Addr>>;
    };
    /**
     * Removes all permissions for current origin and stops all subscriptions
     *
     * ---
     * Required permissions: none
     */
    disconnect: {};
    /**
     * Subscribes to contract updates.
     * Can also be used to update subscriptions
     *
     * ---
     * Required permissions: `tonClient`
     */
    subscribe: {
        input: {
            /**
             * Contract address
             */
            address: Addr;
            /**
             * Subscription changes
             */
            subscriptions: Partial<ContractUpdatesSubscription>;
        };
        output: ContractUpdatesSubscription;
    };
    /**
     * Fully unsubscribe from specific contract updates
     *
     * ---
     * Required permissions: none
     */
    unsubscribe: {
        input: {
            /**
             * Contract address
             */
            address: Addr;
        };
    };
    /**
     * Fully unsubscribe from all contracts
     *
     * ---
     * Required permissions: none
     */
    unsubscribeAll: {};
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    getProviderState: {
        output: {
            /**
             * Provider api version in semver format (x.y.z)
             */
            version: string;
            /**
             * Provider api version in uint32 format (xxxyyyzzz)
             */
            numericVersion: number;
            /**
             * Selected connection name (Mainnet / Testnet)
             */
            selectedConnection: string;
            /**
             * Object with active permissions attached data
             */
            permissions: Partial<Permissions<Addr>>;
            /**
             * Current subscription states
             */
            subscriptions: {
                [address: string]: ContractUpdatesSubscription;
            };
        };
    };
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `tonClient`
     */
    getFullContractState: {
        input: {
            /**
             * Contract address
             */
            address: Addr;
        };
        output: {
            /**
             * Contract state or `undefined` if it doesn't exist
             */
            state: FullContractState | undefined;
        };
    };
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `tonClient`
     */
    getTransactions: {
        input: {
            /**
             * Contract address
             */
            address: Addr;
            /**
             * Id of the transaction from which to request the next batch
             */
            continuation?: TransactionId;
            /**
             * Optional limit. Values greater than 50 have no effect
             */
            limit?: number;
        };
        output: {
            /**
             * Transactions list in descending order (from latest lt to the oldest)
             */
            transactions: Transaction<Addr>[];
            /**
             * Previous transaction id of the last transaction in result. Can be used to continue transactions batch
             */
            continuation: TransactionId | undefined;
        };
    };
    /**
     * Executes external message locally
     *
     * ---
     * Required permissions: `tonClient`
     */
    runLocal: {
        input: {
            /**
             * Contract address
             */
            address: Addr;
            /**
             * Cached contract state
             */
            cachedState?: FullContractState;
            /**
             * Function call params
             */
            functionCall: FunctionCall<Addr>;
        };
        output: {
            /**
             * Execution output
             */
            output: TokensObject<Addr> | undefined;
            /**
             * TVM execution code
             */
            code: number;
        };
    };
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `tonClient`
     */
    getExpectedAddress: {
        input: {
            /**
             * Base64 encoded TVC file
             */
            tvc: string;
            /**
             * Contract ABI
             */
            abi: string;
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
            initParams: TokensObject<Addr>;
        };
        output: {
            /**
             * Contract address
             */
            address: Addr;
        };
    };
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    packIntoCell: {
        input: {
            /**
             * Cell structure
             */
            structure: AbiParam[];
            /**
             * Cell data
             */
            data: TokensObject<Addr>;
        };
        output: {
            /**
             * Base64 encoded cell BOC
             */
            boc: string;
        };
    };
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    unpackFromCell: {
        input: {
            /**
             * Cell structure
             */
            structure: AbiParam[];
            /**
             * Base64 encoded cell BOC
             */
            boc: string;
            /**
             * Don't fail if something is left in a cell after unpacking
             */
            allowPartial: boolean;
        };
        output: {
            /**
             * Cell data
             */
            data: TokensObject<Addr>;
        };
    };
    /**
     * Extracts public key from raw account state
     *
     * NOTE: can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `tonClient`
     */
    extractPublicKey: {
        input: {
            /**
             * Base64 encoded account state
             *
             * @see FullContractState
             */
            boc: string;
        };
        output: {
            /**
             * Hex encoded public key
             */
            publicKey: string;
        };
    };
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `tonClient`
     */
    codeToTvc: {
        input: {
            /**
             * Base64 encoded contract code
             */
            code: string;
        };
        output: {
            /**
             * Base64 encoded state init
             */
            tvc: string;
        };
    };
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `tonClient`
     */
    splitTvc: {
        input: {
            /**
             * Base64 encoded state init
             */
            tvc: string;
        };
        output: {
            /**
             * Base64 encoded init data
             */
            data: string | undefined;
            /**
             * Base64 encoded contract code
             */
            code: string | undefined;
        };
    };
    /**
     * Creates internal message body
     *
     * ---
     * Required permissions: `tonClient`
     */
    encodeInternalInput: {
        input: FunctionCall<Addr>;
        output: {
            /**
             * Base64 encoded message body BOC
             */
            boc: string;
        };
    };
    /**
     * Decodes body of incoming message
     *
     * ---
     * Required permissions: `tonClient`
     */
    decodeInput: {
        input: {
            /**
             * Base64 encoded message body BOC
             */
            body: string;
            /**
             * Contract ABI
             */
            abi: string;
            /**
             * Specific method from specified contract ABI.
             * When an array of method names is passed it will try to decode until first successful
             *
             * > Note! If **`method`** param was provided as string, it will assume that message body contains
             * > specified function and this method will either return output or throw an exception. If you just want
             * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
             * > if message body doesn't contain requested method.
             */
            method: string | string[];
            /**
             * Function call type
             */
            internal: boolean;
        };
        output: {
            /**
             * Decoded method name
             */
            method: string;
            /**
             * Decoded function arguments
             */
            input: TokensObject<Addr>;
        } | null;
    };
    /**
     * Decodes body of outgoing message
     *
     * ---
     * Required permissions: `tonClient`
     */
    decodeOutput: {
        input: {
            /**
             * Base64 encoded message body BOC
             */
            body: string;
            /**
             * Contract ABI
             */
            abi: string;
            /**
             * Specific method from specified contract ABI.
             * When an array of method names is passed it will try to decode until first successful
             *
             * > Note! If **`method`** param was provided as string, it will assume that message body contains
             * > specified function and this method will either return output or throw an exception. If you just want
             * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
             * > if message body doesn't contain requested method.
             */
            method: string | string[];
        };
        output: {
            /**
             * Decoded method name
             */
            method: string;
            /**
             * Decoded function returned value
             */
            output: TokensObject<Addr>;
        } | null;
    };
    /**
     * Decodes body of event message
     *
     * ---
     * Required permissions: `tonClient`
     */
    decodeEvent: {
        input: {
            /**
             * Base64 encoded message body BOC
             */
            body: string;
            /**
             * Contract ABI
             */
            abi: string;
            /**
             * Specific event from specified contract ABI.
             * When an array of event names is passed it will try to decode until first successful
             *
             * > Note! If **`event`** param was provided as string, it will assume that message body contains
             * > specified event and this method will either return output or throw an exception. If you just want
             * > to **_try_** to decode specified event, use **`['event']`**, in that case it will return null
             * > if message body doesn't contain requested event.
             */
            event: string | string[];
        };
        output: {
            /**
             * Decoded event name
             */
            event: string;
            /**
             * Decoded event data
             */
            data: TokensObject<Addr>;
        } | null;
    };
    /**
     * Decodes function call
     *
     * ---
     * Required permissions: `tonClient`
     */
    decodeTransaction: {
        input: {
            /**
             * Transaction with the function call
             */
            transaction: Transaction<Addr>;
            /**
             * Contract ABI
             */
            abi: string;
            /**
             * Specific method from specified contract ABI.
             * When an array of method names is passed it will try to decode until first successful.
             *
             * > Note! If **`method`** param was provided as string, it will assume that transaction contains
             * > specified call and this method will either return output or throw an exception. If you just want
             * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
             * > if transaction doesn't contain requested method.
             */
            method: string | string[];
        };
        output: {
            /**
             * Decoded method name
             */
            method: string;
            /**
             * Decoded function arguments
             */
            input: TokensObject<Addr>;
            /**
             * Decoded function returned value
             */
            output: TokensObject<Addr>;
        } | null;
    };
    /**
     * Decodes transaction events
     *
     * ---
     * Required permissions: `tonClient`
     */
    decodeTransactionEvents: {
        input: {
            /**
             * Transaction with the function call
             */
            transaction: Transaction<Addr>;
            /**
             * Contract ABI
             */
            abi: string;
        };
        output: {
            /**
             * Successfully decoded events
             */
            events: {
                event: string;
                data: TokensObject<Addr>;
            }[];
        };
    };
    /**
     * Calculates transaction fees
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    estimateFees: {
        input: {
            /**
             * This wallet will be used to send the message.
             * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
             */
            sender: Addr;
            /**
             * Message destination address
             */
            recipient: Addr;
            /**
             * Amount of nano TON to send
             */
            amount: string;
            /**
             * Optional function call
             */
            payload?: FunctionCall<Addr>;
        };
        output: {
            /**
             * Fees in nano TON
             */
            fees: string;
        };
    };
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    sendMessage: {
        input: {
            /**
             * Preferred wallet address.
             * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
             */
            sender: Addr;
            /**
             * Message destination address
             */
            recipient: Addr;
            /**
             * Amount of nano TON to send
             */
            amount: string;
            /**
             * Whether to bounce message back on error
             */
            bounce: boolean;
            /**
             * Optional function call
             */
            payload?: FunctionCall<Addr>;
        };
        output: {
            /**
             * Executed transaction
             */
            transaction: Transaction<Addr>;
        };
    };
    /**
     * Sends an external message to the contract
     * Shows and approval window to the user
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    sendExternalMessage: {
        input: {
            /**
             * The public key of the preferred account.
             * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
             */
            publicKey: string;
            /**
             * Message destination address
             */
            recipient: Addr;
            /**
             * Optional base64 encoded `.tvc` file
             */
            stateInit?: string;
            /**
             * Function call
             */
            payload: FunctionCall<Addr>;
        };
        output: {
            /**
             * Executed transaction
             */
            transaction: Transaction<Addr>;
            /**
             * Parsed function call output
             */
            output: TokensObject<Addr> | undefined;
        };
    };
};
/**
 * @category Provider Api
 */
export declare type RawProviderApi = ProviderApi<string>;
/**
 * @category Provider Api
 */
export declare type ProviderEvent = keyof ProviderEvents;
/**
 * @category Provider Api
 */
export declare type ProviderEventData<T extends ProviderEvent, Addr = Address> = ProviderEvents<Addr>[T];
/**
 * @category Provider Api
 */
export declare type RawProviderEventData<T extends ProviderEvent> = ProviderEventData<T, string>;
/**
 * @category Provider Api
 */
export declare type ProviderMethod = keyof ProviderApi;
/**
 * @category Provider Api
 */
export declare type ProviderApiRequestParams<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
    input: infer I;
} ? I : ProviderApi<Addr>[T] extends {} ? undefined : never;
/**
 * @category Provider Api
 */
export declare type RawProviderApiRequestParams<T extends ProviderMethod> = ProviderApiRequestParams<T, string>;
/**
 * @category Provider Api
 */
export declare type ProviderApiResponse<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
    output: infer O;
} ? O : ProviderApi<Addr>[T] extends {} ? undefined : never;
/**
 * @category Provider Api
 */
export declare type RawProviderApiResponse<T extends ProviderMethod> = ProviderApiResponse<T, string>;
/**
 * @category Provider Api
 */
export interface RawProviderRequest<T extends ProviderMethod> {
    method: T;
    params: RawProviderApiRequestParams<T>;
}
