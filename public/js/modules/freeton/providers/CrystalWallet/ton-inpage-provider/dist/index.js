import { parsePermissions, parseTokensObject, parseTransaction, serializeTokensObject } from './models.js';
import { Address, getUniqueId } from './utils.js';
import { Subscriber } from './stream.js';
import { Contract } from './contract.js';
export * from './api.js';
export * from './models.js';
export { Contract, TvmException } from './contract.js';
export { Subscriber } from './stream.js';
export { Address, AddressLiteral, mergeTransactions } from './utils.js';
let ensurePageLoaded;
if (document.readyState == 'complete') {
    ensurePageLoaded = Promise.resolve();
}
else {
    ensurePageLoaded = new Promise((resolve) => {
        window.addEventListener('load', () => {
            resolve();
        });
    });
}
/**
 * @category Provider
 */
export async function hasTonProvider() {
    await ensurePageLoaded;
    return window.hasTonProvider === true;
}
/**
 * @category Provider
 */
export class ProviderRpcClient {
    constructor() {
        this._subscriptions = {};
        this._contractSubscriptions = {};
        this._api = new Proxy({}, {
            get: (_object, method) => (params) => this._ton.request({ method, params: params })
        });
        this._ton = window.ton;
        if (this._ton != null) {
            this._initializationPromise = Promise.resolve();
        }
        else {
            this._initializationPromise = hasTonProvider().then((hasTonProvider) => new Promise((resolve, reject) => {
                if (!hasTonProvider) {
                    reject(new ProviderNotFoundException());
                    return;
                }
                this._ton = window.ton;
                if (this._ton != null) {
                    resolve();
                }
                else {
                    window.addEventListener('ton#initialized', (_data) => {
                        this._ton = window.ton;
                        resolve();
                    });
                }
            }));
        }
        this._initializationPromise.then(() => {
            if (this._ton == null) {
                return;
            }
            const knownEvents = {
                'disconnected': (data) => data,
                'transactionsFound': (data) => ({
                    address: new Address(data.address),
                    transactions: data.transactions.map(parseTransaction),
                    info: data.info
                }),
                'contractStateChanged': (data) => ({
                    address: new Address(data.address),
                    state: data.state
                }),
                'networkChanged': data => data,
                'permissionsChanged': (data) => ({
                    permissions: parsePermissions(data.permissions)
                }),
                'loggedOut': data => data
            };
            for (const [eventName, extractor] of Object.entries(knownEvents)) {
                this._ton.addListener(eventName, (data) => {
                    const handlers = this._subscriptions[eventName];
                    if (handlers == null) {
                        return;
                    }
                    const parsed = extractor(data);
                    for (const handler of Object.values(handlers)) {
                        handler(parsed);
                    }
                });
            }
        });
    }
    /**
     * Checks whether ton provider exists.
     */
    async hasProvider() {
        return hasTonProvider();
    }
    /**
     * Waits until provider api will be available.
     *
     * @throws ProviderNotFoundException when no provider found
     */
    async ensureInitialized() {
        await this._initializationPromise;
    }
    /**
     * Whether provider api is ready
     */
    get isInitialized() {
        return this._ton != null;
    }
    /**
     * Raw provider
     */
    get raw() {
        return this._ton;
    }
    /**
     * Raw provider api
     */
    get rawApi() {
        return this._api;
    }
    /**
     * Creates typed contract wrapper.
     *
     * @param abi Readonly object (must be declared with `as const`)
     * @param address Default contract address
     */
    createContract(abi, address) {
        return new Contract(abi, address);
    }
    /**
     * Creates subscriptions group
     */
    createSubscriber() {
        return new Subscriber(this);
    }
    /**
     * Requests new permissions for current origin.
     * Shows an approval window to the user.
     * Will overwrite already existing permissions
     *
     * ---
     * Required permissions: none
     */
    async requestPermissions(args) {
        const result = await this._api.requestPermissions({
            permissions: args.permissions
        });
        return parsePermissions(result);
    }
    /**
     * Removes all permissions for current origin and stops all subscriptions
     */
    async disconnect() {
        await this._api.disconnect();
    }
    async subscribe(eventName, params) {
        class SubscriptionImpl {
            constructor(_subscribe, _unsubscribe) {
                this._subscribe = _subscribe;
                this._unsubscribe = _unsubscribe;
                this._listeners = {
                    ['data']: [],
                    ['subscribed']: [],
                    ['unsubscribed']: []
                };
            }
            on(eventName, listener) {
                this._listeners[eventName].push(listener);
                return this;
            }
            async subscribe() {
                await this._subscribe(this);
                for (const handler of this._listeners['subscribed']) {
                    handler();
                }
            }
            async unsubscribe() {
                await this._unsubscribe();
                for (const handler of this._listeners['unsubscribed']) {
                    handler();
                }
            }
            notify(data) {
                for (const handler of this._listeners['data']) {
                    handler(data);
                }
            }
        }
        let existingSubscriptions = this._getEventSubscriptions(eventName);
        const id = getUniqueId();
        switch (eventName) {
            case 'disconnected':
            case 'networkChanged':
            case 'permissionsChanged':
            case 'loggedOut': {
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = (data) => {
                        subscription.notify(data);
                    };
                }, async () => {
                    delete existingSubscriptions[id];
                });
                await subscription.subscribe();
                return subscription;
            }
            case 'transactionsFound':
            case 'contractStateChanged': {
                const address = params.address.toString();
                const subscription = new SubscriptionImpl(async (subscription) => {
                    if (existingSubscriptions[id] != null) {
                        return;
                    }
                    existingSubscriptions[id] = ((data) => {
                        if (data.address.toString() == address) {
                            subscription.notify(data);
                        }
                    });
                    let contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        contractSubscriptions = {};
                        this._contractSubscriptions[address] = contractSubscriptions;
                    }
                    contractSubscriptions[id] = {
                        state: eventName == 'contractStateChanged',
                        transactions: eventName == 'transactionsFound'
                    };
                    const { total, withoutExcluded } = foldSubscriptions(Object.values(contractSubscriptions), contractSubscriptions[id]);
                    try {
                        if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                            await this.rawApi.subscribe({ address, subscriptions: total });
                        }
                    }
                    catch (e) {
                        delete existingSubscriptions[id];
                        delete contractSubscriptions[id];
                        throw e;
                    }
                }, async () => {
                    delete existingSubscriptions[id];
                    const contractSubscriptions = this._contractSubscriptions[address];
                    if (contractSubscriptions == null) {
                        return;
                    }
                    const updates = contractSubscriptions[id];
                    const { total, withoutExcluded } = foldSubscriptions(Object.values(contractSubscriptions), updates);
                    delete contractSubscriptions[id];
                    if (!withoutExcluded.transactions && !withoutExcluded.state) {
                        await this.rawApi.unsubscribe({ address });
                    }
                    else if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
                        await this.rawApi.subscribe({ address, subscriptions: withoutExcluded });
                    }
                });
                await subscription.subscribe();
                return subscription;
            }
            default: {
                throw new Error(`Unknown event ${eventName}`);
            }
        }
    }
    /**
     * Returns provider api state
     *
     * ---
     * Required permissions: none
     */
    async getProviderState() {
        const state = await this._api.getProviderState();
        return Object.assign(Object.assign({}, state), { permissions: parsePermissions(state.permissions) });
    }
    /**
     * Requests contract data
     *
     * ---
     * Required permissions: `tonClient`
     */
    async getFullContractState(args) {
        return await this._api.getFullContractState({
            address: args.address.toString()
        });
    }
    /**
     * Requests contract transactions
     *
     * ---
     * Required permissions: `tonClient`
     */
    async getTransactions(args) {
        const { transactions, continuation } = await this._api.getTransactions(Object.assign(Object.assign({}, args), { address: args.address.toString() }));
        return {
            transactions: transactions.map(parseTransaction),
            continuation
        };
    }
    /**
     * Calculates contract address from code and init params
     *
     * ---
     * Required permissions: `tonClient`
     */
    async getExpectedAddress(abi, args) {
        const { address } = await this._api.getExpectedAddress(Object.assign(Object.assign({ abi: JSON.stringify(abi) }, args), { initParams: serializeTokensObject(args.initParams) }));
        return new Address(address);
    }
    /**
     * Creates base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    async packIntoCell(args) {
        return await this._api.packIntoCell({
            structure: args.structure,
            data: serializeTokensObject(args.data)
        });
    }
    /**
     * Decodes base64 encoded BOC
     *
     * ---
     * Required permissions: `tonClient`
     */
    async unpackFromCell(args) {
        const { data } = await this._api.unpackFromCell(Object.assign(Object.assign({}, args), { structure: args.structure }));
        return {
            data: parseTokensObject(args.structure, data)
        };
    }
    /**
     * Extracts public key from raw account state
     *
     * NOTE: can only be used on contracts which are deployed and has `pubkey` header
     *
     * ---
     * Required permissions: `tonClient`
     */
    async extractPublicKey(boc) {
        const { publicKey } = await this._api.extractPublicKey({
            boc
        });
        return publicKey;
    }
    /**
     * Converts base64 encoded contract code into tvc with default init data
     *
     * ---
     * Required permissions: `tonClient`
     */
    async codeToTvc(code) {
        const { tvc } = await this._api.codeToTvc({
            code
        });
        return tvc;
    }
    /**
     * Splits base64 encoded state init into code and data
     *
     * ---
     * Required permissions: `tonClient`
     */
    async splitTvc(tvc) {
        return await this._api.splitTvc({
            tvc
        });
    }
    /**
     * Sends internal message from user account.
     * Shows an approval window to the user.
     *
     * ---
     * Required permissions: `accountInteraction`
     */
    async sendMessage(args) {
        const { transaction } = await this._api.sendMessage(Object.assign(Object.assign({}, args), { sender: args.sender.toString(), recipient: args.recipient.toString(), payload: args.payload ? ({
                abi: args.payload.abi,
                method: args.payload.method,
                params: serializeTokensObject(args.payload.params)
            }) : undefined }));
        return {
            transaction: parseTransaction(transaction)
        };
    }
    _getEventSubscriptions(eventName) {
        let existingSubscriptions = this._subscriptions[eventName];
        if (existingSubscriptions == null) {
            existingSubscriptions = {};
            this._subscriptions[eventName] = existingSubscriptions;
        }
        return existingSubscriptions;
    }
}
/**
 * @category Provider
 */
export class ProviderNotFoundException extends Error {
    constructor() {
        super('TON provider was not found');
    }
}
function foldSubscriptions(subscriptions, except) {
    const total = { state: false, transactions: false };
    const withoutExcluded = Object.assign({}, total);
    for (const item of subscriptions) {
        if (withoutExcluded.transactions && withoutExcluded.state) {
            break;
        }
        total.state || (total.state = item.state);
        total.transactions || (total.transactions = item.transactions);
        if (item != except) {
            withoutExcluded.state || (withoutExcluded.state = item.state);
            withoutExcluded.transactions || (withoutExcluded.transactions = item.transactions);
        }
    }
    return { total, withoutExcluded };
}
const provider = new ProviderRpcClient();
/**
 * @category Provider
 */
export default provider;
