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


class TokensList {
    constructor(listUrl = '/json/tokensList.json') {
        this.listUrl = listUrl;
        this.name = '';
        this.version = '';
        this.url = '';
        this.tokens = [];
    }

    /**
     * Load token list
     * @returns {Promise<TokensList>}
     */
    async load(network = 'main') {
        let listJSON = await ((await fetch(this.listUrl))).json();
        for (let key of Object.keys(listJSON)) {
            this[key] = listJSON[key];
        }

        let newTokens = [];

        for (let token of this.tokens) {
            if(token.network === network) {
                newTokens.push(token);
            }
        }

        this.tokens = newTokens;

        return this;
    }

    /**
     * Get full tokenlist
     * @returns {Promise<[]>}
     */
    async getTokens() {
        return this.tokens;
    }

    /**
     * Get token by root address
     * @param {string} rootAddress
     * @returns {Promise<*>}
     */
    async getTokenByRootAddress(rootAddress) {
        for (let token of this.tokens) {
            if(token.rootAddress === rootAddress) {
                return token;
            }
        }
    }
}

export default TokensList;