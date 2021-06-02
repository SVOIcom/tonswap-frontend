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


class TokenWalletContract {
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

    async init(address) {
        this.contract = await this.ton.loadContract('/contracts/abi/TONTokenWallet.abi.json', address);
        return this;
    }

    /**
     * Get tokens balance
     * @returns {Promise<number>}
     */
    async getBalance() {
        return ((await this.contract.balance({_answer_id: 0})).value0);
    }

    async transfer(to, tokens, payload, grams = 2e8,) {
        return await this.contract.transfer.deploy({
            to,
            grams,
            tokens: (tokens),
            notify_receiver: true,
            send_gas_to: '0:0000000000000000000000000000000000000000000000000000000000000000',
            payload
        });
    }
}


export default TokenWalletContract;