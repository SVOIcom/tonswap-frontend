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


import TokenHolder from "./TokenHolder.mjs";
import TokensList from "../tonswap/TokensList.mjs";
import tokenList from "./tokenList.mjs";

class UI extends EventEmitter3 {
    constructor() {
        super();
        this.tokensList = null;
    }

    async init() {
        //Load tokens list
        this.tokensList = await new TokensList().load();
        console.log(await this.tokensList.getTokens());

        //Load tokens lists on page
        tokenList.load(await this.tokensList.getTokens());

        //Initialize token holders
        this.tokenHolderFrom = new TokenHolder($('.tokenHolderFrom'), this.tokensList);
        this.tokenHolderTo = new TokenHolder($('.tokenHolderTo'), this.tokensList);

        //Reverse button
        $('.reverseExchange').click(() => {
            let newTokenTo = this.tokenHolderFrom.address;
            this.tokenHolderFrom.setToken(this.tokenHolderTo.address);
            this.tokenHolderTo.setToken(newTokenTo);

            this.emit('exchangeChange');
        })

        //Handle token change
        tokenList.on('fromTokenChange', async (rootAddress) => {
            await this.tokenHolderFrom.setToken(rootAddress);
            this.emit('exchangeChange');
        });

        tokenList.on('toTokenChange', async (rootAddress) => {
            await this.tokenHolderTo.setToken(rootAddress);
            this.emit('exchangeChange');
        });

        //Handle amount change
        $('.fromAmount,.toAmount').keyup(() => {
            this.emit('exchangeChange');
        })

        return this;
    }

    /**
     * Get exchange info
     * @returns {Promise<{fromAmount: (jQuery|string|*), toAmount: (jQuery|string|*), from: *, to: *}>}
     */
    async getTokens() {
        return {
            from: await this.tokenHolderFrom.getToken(),
            to: await this.tokenHolderTo.getToken(),
            fromAmount: Number($('.fromAmount').val()),
            toAmount: Number($('.toAmount').val())
        }
    }
}

/**
 * UI factory
 * @type {{initialize(): Promise<UI>}}
 */
const ui = {
    async initialize() {
        return await new UI().init();
    }
};

export default ui;