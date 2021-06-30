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

/**
 * Contract class
 */
class Contract {
    constructor(abi, address, ton, parent) {
        //this.provider = provider;
        this.parent = parent;
        this.abi = abi;
        this.address = address;
        //this.contract = new freeton.Contract(provider, abi, address);
        this.ton = ton;


        let that = this;

        //Setup methods
        for (let {name} of abi.functions) {
            if(name === 'constructor') {
                continue;
            }
            this[name] = async function (args = undefined) {
                return await that.getMethod(name, args);
            }

            //Make method deployable
            this[name].deploy = async function (args = undefined) {
                return await that.deployMethod(name, args);
            }
        }
    }

    /**
     * Get current provider
     * @returns {*}
     */
    getProvider() {
        return this.ton;
    }

    /**
     * Get TON client
     * @returns {TONClient}
     */
    getTONClient() {
        return this.ton;
    }

    /**
     * Get raw contract object
     * @returns {*}
     */
    getProviderContract() {
        return this.contract;
    }

    /**
     * Return account info for contract
     * @returns {Promise<*>}
     */
    async getAccount() {
        return await this.ton.contracts.getAccount(this.address);
    }

    /**
     * Return balance for contract
     * @returns {Promise<number>}
     */
    async getBalance() {
        let account = await this.getAccount();
        let balance = Number(account.balance);
        return balance;
    }

    /**
     * Run method locally
     * @param {string} method
     * @param {array|object} args
     * @returns {Promise<*>}
     */
    async getMethod(method, args = {}) {
        return (await this.ton.contracts.runLocal({
            abi: this.abi,
            functionName: method,
            input: args,
            address: this.address
        })).output;
        //return await this.contract.functions[method].runGet(args);
    }

    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = {}) {
        let params = {
            address: this.address,
            abi: this.abi,
            functionName: method,
            input: args,
            keyPair: await this.parent.getKeypair()
        };
        console.log('DEPLOY METHOD', params);
        let message = await this.parent.provider.contracts.createRunMessage(params);
        console.log('MESSAGE', message, await this.parent.provider);
        let transaction = await this.parent.provider.contracts.sendMessage(message.message);
        console.log('TX', transaction);

        let result = await this.parent.provider.contracts.waitForRunTransaction(message, transaction);

        result.tx = transaction;

        return result;
    }

    async deployPayload(method, args = {}) {


        const callSet = {
            function_name: method,
            input: args
        }
        const encoded_msg = await this.ton.abi.encode_message_body({
            abi: JSON.stringify(this.abi),
            call_set: callSet,
            is_internal: true,
            signer: {
                type: 'None'
            }
        });

        return encoded_msg.body;

    }

}

export default Contract;