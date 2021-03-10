/*_______ ____  _   _  _____
 |__   __/ __ \| \ | |/ ____|
    | | | |  | |  \| | (_____      ____ _ _ __
    | | | |  | | . ` |\___ \ \ /\ / / _` | '_ \
    | | | |__| | |\  |____) \ V  V / (_| | |_) |
    |_|  \____/|_| \_|_____/ \_/\_/ \__,_| .__/
                                         | |
                                         |_| */
import utils from "../../utils.mjs";

/**
 * @name TONSwap project - tonswap.com
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


class SwapPairContract {
    /**
     *
     * @param {ExtraTon} ton
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
    async init(address) {
        this.contract = await this.ton.loadContract('/contracts/abi/SwapPairContract.abi.json', address);
        return this;
    }

    /**
     * Get pair info
     * @returns {Promise<*>}
     */
    async getPairInfo() {
        return (await this.contract.getPairInfo()).info;
    }


    /**
     * Return user balances
     * @returns {Promise<{}>}
     */
    async getUserBalance() {
        let pubkey = '0x' + (await this.ton.getKeypair()).public;
        let balance = await this.contract.getUserBalance({pubkey})

        let balances = {};
        balances[balance.ubi.tokenRoot1] = Number(balance.ubi.tokenBalance1);
        balances[balance.ubi.tokenRoot2] = Number(balance.ubi.tokenBalance2);
        balances.raw = balance.ubi;
        return balances;
    }


    /**
     * Get exchange rate
     * @param fromTokenRootAddress
     * @param amount
     * @returns {Promise<*>}
     */
    async getExchangeRate(fromTokenRootAddress, amount) {
        let result = await this.contract.getExchangeRate({
            swappableTokenRoot: fromTokenRootAddress,
            swappableTokenAmount: amount
        })
        return result.value0;
    }

    /**
     * Withdraw tokens from pair
     *
     * @deploy
     *
     * @param tokenRoot
     * @param dest
     * @param amount
     * @returns {Promise<*>}
     */
    async withdrawTokens(tokenRoot, dest, amount) {
        return await this.contract.withdrawTokens.deploy({
            withdrawalTokenRoot: tokenRoot,
            receiveTokenWallet: dest,
            amount
        });
    }

    /**
     *
     * SWAP, BABY, SWAP!
     *
     * @deploy
     *
     * @param tokenRoot
     * @param amount
     * @returns {Promise<*>}
     */
    async swap(tokenRoot, amount){
        return await this.contract.swap.deploy({
            swappableTokenRoot: tokenRoot,
            swappableTokenAmount: amount,
        });
    }

}


export default SwapPairContract;