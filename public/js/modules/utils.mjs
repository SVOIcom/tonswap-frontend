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


const utils = {
    shortenPubkey: (pubkey, delimiter = '...') => {
        pubkey = String(pubkey);
        return pubkey.substr(0, 6) + delimiter + pubkey.substr(-4);
    },
    formatToken: (number, precision = 1) => {
        if(precision === 1) {
            return String(number);
        }
        let nulls = String(precision).replace(/[1-9]*/, '').length;
        let result = String(Math.round(number));
        let right = result.slice(-nulls);
        if(nulls - right.length > 0) {
            for (let i = 1; nulls - right.length; i++) {
                right = '0' + right;
            }
        }
        return (result.length <= nulls ? '0' : result.slice(0, -nulls)) + '.' + right;
    }
}
export default utils;