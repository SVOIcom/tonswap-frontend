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

import TonWeb from "./providers/TonWeb/TonWeb.mjs";
import TonWallet from "./providers/TonWallet/TonWallet.mjs";
import CrystalWallet from "./providers/CrystalWallet/CrystalWallet.mjs";

const PROVIDERS = {
    TonWallet: 'tonwallet',
    TonWeb: 'tonweb',
    CrystalWallet: 'crystalwallet',
};


const PROVIDERS_INSTANCES = {
    tonweb: TonWeb,
    tonwallet: TonWallet,
    crystalwallet: CrystalWallet
}


/**
 * Provider factory
 * @param {object|undefined} options
 * @param {string} provider
 * @returns {*}
 */
function getProvider(options = undefined, provider = PROVIDERS.TonWallet) {
    if(PROVIDERS_INSTANCES[provider]) {
        return new PROVIDERS_INSTANCES[provider](options);
    } else {
        throw new Error('Invalid provider ' + provider);
    }
}

export {getProvider as default, PROVIDERS};