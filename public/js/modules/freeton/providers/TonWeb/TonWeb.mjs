/*_______ ____  _   _  _____
 |__   __/ __ \| \ | |/ ____|
    | | | |  | |  \| | (_____      ____ _ _ __
    | | | |  | | . ` |\___ \ \ /\ / / _` | '_ \
    | | | |__| | |\  |____) \ V  V / (_| | |_) |
    |_|  \____/|_| \_|_____/ \_/\_/ \__,_| .__/
                                         | |
                                         |_| */
/**
 * @name TONSwap project - tonswap.com
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


import Contract from "./Contract.mjs";
import Account, {SEED_LENGTH, TONMnemonicDictionary} from "./Account.mjs";


const NETWORKS = {
    main: 'main.ton.dev',
    test: 'net.ton.dev'
};

const REVERSE_NETWORKS = {
    'main.ton.dev': 'main',
    'net.ton.dev': 'test'
}

const EXPLORERS = {
    test: 'net.ton.live',
    main: 'main.ton.live',
}

/**
 * extraTON provider class
 */
class TonWeb extends EventEmitter3 {
    constructor(options = {provider: null}) {
        super();
        this.options = options;
        //this.provider = new freeton.providers.ExtensionProvider(options.provider);
        this.ton = null

        this.pubkey = null;

        this.walletContract = null;
        this.walletBalance = 0;

        this.network = 'test';
        this.networkServer = NETWORKS.test;

        this.account = null;


        this.watchdogTimer = null;
    }

    /**
     * Initialize extraTON provider
     * @returns {Promise<TonWeb>}
     */
    async init() {

        console.log('TonWeb provider used');

        //Create "oldschool" ton provider
        this.ton = await TONClient.create({
            servers: [this.networkServer]
        });

        //Changes watchdog timer
        this.watchdogTimer = setInterval(async () => {

            //Watch for network changed
            let networkServer = (await this.getNetwork()).server
            if(this.networkServer !== networkServer) {
                if(this.networkServer !== null) {
                    this.emit('networkChanged', REVERSE_NETWORKS[networkServer], this,);
                }

                this.network = REVERSE_NETWORKS[networkServer];
                this.networkServer = networkServer;
            }

            //Watch for account changed
            let pubkey = (await this.getKeypair()).public
            if(this.pubkey !== pubkey) {
                if(this.pubkey !== null) {
                    this.emit('pubkeyChanged', pubkey, this,);
                }
                this.pubkey = pubkey;
            }

            //Watch for wallet balance changed
            let wallet = await this.getWallet()
            let newBalance = wallet.balance;
            if(this.walletBalance !== newBalance) {
                this.emit('balanceChanged', newBalance, wallet, this,);
                this.walletBalance = newBalance;
            }

        }, 1000);

        return this;
    }

    /**
     * Accept account
     * @param publicKey
     * @param seed
     * @param seedLength
     * @param seedDict
     * @returns {Promise<Account>}
     */
    async acceptAccount(publicKey, seed, seedLength, seedDict) {
        return this.account = new Account(this.ton, publicKey, seed, seedLength, seedDict);
    }

    /**
     * Change network
     * @param {string} networkServer Network server address
     * @returns {Promise<void>}
     */
    async setNetwork(networkServer) {
        this.networkServer = networkServer;
        this.network = REVERSE_NETWORKS[networkServer];

        //Recreate TON provider
        this.ton = await TONClient.create({
            servers: [this.networkServer]
        });

        this.emit('networkChanged', this.network, this,);
    }

    /**
     * Get raw extraTON provider
     * @returns {*}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Return network
     * @returns {Promise<*>}
     */
    async getNetwork() {
        return {server: this.networkServer, explorer: EXPLORERS[this.network]};
    }

    /**
     * Get keypair as possible
     * @returns {Promise<{public: *, secret: null}>}
     */
    async getKeypair(privateRequest = false) {
        //let publicKey = (await this.provider.getSigner()).publicKey;
        if(this.account) {
            return {
                public: await this.account.getPublic(),
                secret: privateRequest ? await this.account.getPrivate(privateRequest) : null
            };
        }
        return {public: '00000000000000000000000000000000000000', secret: null};
    }

    /**
     * Return user TON wallet if exists
     * @returns {Promise<*>}
     */
    async getWallet() {
        /*let wallet = (await this.provider.getSigner()).wallet;
        //Wallet exists
        if(wallet.address) {

            if(!this.walletContract) {
                this.walletContract = await this.loadContract('/contracts/abi/SafeMultisigWallet.abi.json', wallet.address);
            }
            //Load user wallet (potentially compatible with SafeMiltisig)
            wallet.contract = this.walletContract;
            wallet.balance = await this.walletContract.getBalance();
        }
        return wallet;*/

        return {address: '00000000000000000000000000000000000000', balance: 0, contract: null}
    }

    /**
     * Create contract instance by ABI
     * @param {object} abi
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async initContract(abi, address) {
        return new Contract(abi, address, this.ton, this);
    }

    /**
     * Load contract ABI by URL or abi
     * @param {string|object} abiJson
     * @param {string} address
     * @returns {Promise<Contract>}
     */
    async loadContract(abiJson, address) {
        if(typeof abiJson === 'string') {
            abiJson = await ((await fetch(abiJson))).json();
        }

        return this.initContract(abiJson, address)
    }

    /**
     * Create contract instance by JSON
     * @param {string|object} contractJson
     * @param {number|string} networkId
     * @returns {Promise<Contract>}
     */
    async loadContractFrom(contractJson, networkId = "1") {
        networkId = String(networkId);
        if(typeof contractJson === 'string') {
            contractJson = await ((await fetch(contractJson))).json();
        }
        const Contract = contractJson;

        return await this.initContract(Contract.abi, Contract.networks[networkId].address);
    }
}

export default TonWeb;