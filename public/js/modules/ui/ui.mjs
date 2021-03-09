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
import PairsRootContract from "../tonswap/contracts/PairsRootContract.mjs";
import utils from "../utils.mjs";

class UI extends EventEmitter3 {
    /**
     *
     * @param {ExtraTon} ton
     * @param {object} config
     */
    constructor(ton, config) {
        super();
        this.tokensList = null;
        this.ton = ton;
        this.config = config;
    }

    async updateExchange() {
        let exchangeInfo = await this.getTokens();

        try {
            let pairInfo = await this.swapRoot.getPairInfo(exchangeInfo.from.rootAddress, exchangeInfo.to.rootAddress);
            console.log(pairInfo);

            $('.pairAddress').text(utils.shortenPubkey(pairInfo.swapPairAddress));
            $('.pairAddress').attr('href','google.ru');
        } catch (e) {
            console.log('EXCEPTION',e);
        }

        this.emit('exchangeChange');
    }

    async init() {
        //Init contracts
        this.swapRoot = await new PairsRootContract(this.ton, this.config).init();


        //Load tokens list
        this.tokensList = await new TokensList().load();
        console.log(await this.tokensList.getTokens());

        //Load tokens lists on page
        tokenList.load(await this.tokensList.getTokens());

        //Initialize token holders
        this.tokenHolderFrom = new TokenHolder($('.tokenHolderFrom'), this.tokensList);
        this.tokenHolderTo = new TokenHolder($('.tokenHolderTo'), this.tokensList);

        //Reverse button
        $('.reverseExchange').click(async () => {
            let newTokenTo = this.tokenHolderFrom.address;
            this.tokenHolderFrom.setToken(this.tokenHolderTo.address);
            this.tokenHolderTo.setToken(newTokenTo);

            let newToAmount = $('.fromAmount').val();
            $('.fromAmount').val($('.toAmount').val());
            $('.toAmount').val(newToAmount);

            await this.updateExchange();
        })

        //Handle token change
        tokenList.on('fromTokenChange', async (rootAddress) => {
            await this.tokenHolderFrom.setToken(rootAddress);
            await this.updateExchange();
        });

        tokenList.on('toTokenChange', async (rootAddress) => {
            await this.tokenHolderTo.setToken(rootAddress);
            await this.updateExchange();
        });

        //Handle amount change
        $('.fromAmount,.toAmount').keyup(async () => {
            await this.updateExchange();
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
    async initialize(TON, config) {
        return await new UI(TON, config).init();
    }
};

export default ui;


