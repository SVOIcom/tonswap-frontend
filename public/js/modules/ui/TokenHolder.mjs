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

class TokenHolder extends EventEmitter3 {
    /**
     *
     * @param element
     * @param {TokensList} tokenList
     */
    constructor(element, tokenList) {
        super();
        this.element = $(element);
        this.tokenList = tokenList;
        this.address = null;

        this.reset();
    }

    /**
     * Reset holder
     */
    reset() {
        this.address = null;
        this.element.removeClass('exchange-form__input-select_selected');
        this.element.html(`Select a token  <i></i>`);
    }

    /**
     * Set selected token
     * @param rootAddress
     * @returns {Promise<void>}
     */
    async setToken(rootAddress) {
        if(!rootAddress) {
            this.reset();
            return;
        }
        let token = await this.tokenList.getTokenByRootAddress(rootAddress);
        this.address = rootAddress;
        this.element.html(`<img src="${token.icon}" alt="" data-address="${token.symbol}"><span class="tokenHolderText">${token.symbol}</span><i></i>`);
        this.element.addClass('exchange-form__input-select_selected');
    }

    /**
     * Return current address
     * @returns {Promise<*>}
     */
    async getToken() {
        if(!this.address) {
            return null;
        }
        return await this.tokenList.getTokenByRootAddress(this.address);
    }
}


export default TokenHolder;