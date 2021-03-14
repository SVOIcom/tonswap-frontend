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


/**
 * Configuration
 */
export default {
    test: {
        pairRootAddress: '0:9bf6541e085f374985cd620ae46572865cf2479b125aac9c0b34d343ffcaa5a8',
    },
    main: {
        pairRootAddress: '0:ebcd0b451b83cd2f6dfaf197ef0aa9a38cd94981a340407c8d01c26671029cdc',
    },
    local: {
        pairRootAddress: '0:8d4f5b96957291a047891dfb9b66bbfb4ac4d764244fe2b02bad16f840734ece',
    },
    "http://localhost:3333": {
        pairRootAddress: '0:8d4f5b96957291a047891dfb9b66bbfb4ac4d764244fe2b02bad16f840734ece',
    },
    "https://devnet.tonswap.com": {
        pairRootAddress: '0:8d4f5b96957291a047891dfb9b66bbfb4ac4d764244fe2b02bad16f840734ece',
    },
}