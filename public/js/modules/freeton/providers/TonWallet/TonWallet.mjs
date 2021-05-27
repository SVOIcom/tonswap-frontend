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

import freeton from "/modules/freeton/index.js";
import Contract from "./Contract.mjs";
import utils from "../../../utils.mjs";


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
    local: 'main.ton.live',
}


/**
 * extraTON provider class
 */
class TonWallet extends EventEmitter3 {
    constructor(options = {provider: window.freeton}) {
        super();
        this.options = options;
        this.provider = null;
        this.ton = null
        this.networkServer = null;
        this.pubkey = null;

        this.walletContract = null;
        this.walletBalance = 0;

        this.network = 'test';

    }

    /**
     * Initialize extraTON provider
     * @returns {Promise<ExtraTon>}
     */
    async init() {

        //Detect is extraTON exists
        if(!window.getTONWeb) {
            throw new Error("TONWallet extension not found");
        }

        this.provider = await window.getTONWeb();

        //Check extraTON connection
        try {
            await this.provider.extension.getVersion();
        } catch (e) {
            console.error(e);
            throw new Error("Can't access to TONWallet");
        }

        //Create "oldschool" ton provider
        this.ton = await TONClient.create({
            servers: [(await this.provider.network.get()).network.url]
        });

        //Changes watchdog timer
        const syncNetwork = async () => {

            //Watch for network changed
            let networkServer = (await this.provider.network.get()).network.url;
            if(this.networkServer !== networkServer) {
                if(this.networkServer !== null) {
                    this.emit('networkChanged', networkServer, this.networkServer, this,);
                }

                this.network = REVERSE_NETWORKS[networkServer];
                if(!this.network) {
                    this.network = networkServer;
                }
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
            //console.log(this.walletBalance, newBalance);
            if(this.walletBalance !== newBalance) {
                this.emit('balanceChanged', newBalance, wallet, this,);
                this.walletBalance = newBalance;
            }

        };
        this.watchdogTimer = setInterval(syncNetwork, 1000);
        await syncNetwork();

        return this;
    }

    async acceptAccount(publicKey, seed, seedLength, seedDict) {
        throw new Error('Accept account unsupported by TonWallet provider');
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
    async getKeypair() {
        let publicKey = (await this.provider.accounts.getAccount()).public;
        return {public: publicKey, secret: null};
    }

    /**
     * Return user TON wallet if exists
     * @returns {Promise<*>}
     */
    async getWallet() {
        //let wallet = (await this.provider.getSigner()).wallet;
        let wallet = (await this.provider.accounts.getWalletInfo());
        //Wallet exists
        if(wallet.address) {

            if(!this.walletContract) {
                this.walletContract = await this.loadContract('/contracts/abi/SafeMultisigWallet.abi.json', wallet.address);
            }
            //Load user wallet (potentially compatible with SafeMiltisig)
            wallet.contract = this.walletContract;
            wallet.balance = await this.walletContract.getBalance();
        }
        return wallet;
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

    /**
     * Send TON with message
     * @param {string} dest
     * @param {string|number} amount
     * @param {string} pubkey
     * @returns {Promise<*>}
     */
    async sendTONWithPubkey(dest, amount, pubkey) {

        let transferBody = utils.createPubkeyTVMCELL(pubkey);
        return await (await this.getWallet()).transfer(dest, amount, false, transferBody);
    }
}

export default TonWallet;