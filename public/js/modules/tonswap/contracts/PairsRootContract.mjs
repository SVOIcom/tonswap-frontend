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


class PairsRootContract {
    /**
     *
     * @param {TonWallet} ton
     * @param {object} config
     */
    constructor(ton, config) {
        this.ton = ton;
        this.config = config;
        this.contract = null;
    }

    /**
     * Init contract
     * @returns {Promise<PairsRootContract>}
     */
    async init() {
        this.contract = await this.ton.loadContract('/contracts/abi/RootSwapPairContract.abi.json', this.config.pairRootAddress);
        return this;
    }

    /**
     * Get pair info by token roots
     * @param tokenRoot1
     * @param tokenRoot2
     * @returns {Promise<*>}
     */
    async getPairInfo(tokenRoot1, tokenRoot2) {
        return (await this.contract.getPairInfo({
            tokenRootContract1: tokenRoot1,
            tokenRootContract2: tokenRoot2
        })).value0;
    }

    /**
     * Create new pair
     * @param tokenRoot1
     * @param tokenRoot2
     * @returns {Promise<*>}
     */
    async deploySwapPair(tokenRoot1, tokenRoot2) {
        return await this.contract.deploySwapPair.deploy({
            tokenRootContract1: tokenRoot1,
            tokenRootContract2: tokenRoot2
        });
    }


}


export default PairsRootContract;