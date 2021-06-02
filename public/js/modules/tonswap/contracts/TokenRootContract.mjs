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


class TokenRootContract {
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
        this.contract = await this.ton.loadContract('/contracts/abi/RootTokenContract.abi.json', address);
        return this;
    }

    /**
     * Get pair info
     * @returns {Promise<*>}
     */
    async getDetails() {
        return (await this.contract.getDetails({_answer_id: 0})).value0;
    }

    async getWalletAddress() {
        let pubkey = '0x' + (await this.ton.getKeypair()).public;
        return (await this.contract.getWalletAddress({
            _answer_id: 0,
            wallet_public_key_: pubkey,
            owner_address_: '0:0000000000000000000000000000000000000000000000000000000000000000'
        })).value0;
    }


}


export default TokenRootContract;