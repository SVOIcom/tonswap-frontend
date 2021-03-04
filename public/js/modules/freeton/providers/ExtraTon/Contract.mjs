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
    constructor(provider, abi, address) {
        this.provider = provider;
        this.abi = abi;
        this.address = address;
        this.contract = new freeton.Contract(provider, abi, address);

        let that = this;

        //Setup methods
        for (let method of Object.keys(this.contract.functions)) {
            this[method] = async function (args = undefined) {
                return await that.getMethod(method, args);
            }

            //Make method deployable
            this[method].deploy = async function (args = undefined) {
                return await that.deployMethod(method, args);
            }
        }
    }

    /**
     * Get current provider
     * @returns {*}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * Get raw contract object
     * @returns {*}
     */
    getProviderContract() {
        return this.contract;
    }

    /**
     * Run method locally
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async getMethod(method, args = undefined) {
        return await this.contract.functions[method].runGet(args);
    }

    /**
     * Deploy method
     * @param {string} method
     * @param {undefined|array|object} args
     * @returns {Promise<*>}
     */
    async deployMethod(method, args = undefined) {
        console.log(this.contract.functions[method]);
        return await this.contract.functions[method].run(args);
    }

}

export default Contract;