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
        pairRootAddress: '0:dfa8556ad55b0a383378568256da5e8360c2ad97af06214b9919dd43627f6fce',
    },
    main: {
        pairRootAddress: '0:ebcd0b451b83cd2f6dfaf197ef0aa9a38cd94981a340407c8d01c26671029cdc',
    },
    local: {
        pairRootAddress: '0:ebcd0b451b83cd2f6dfaf197ef0aa9a38cd94981a340407c8d01c26671029cdc',
    },
    "http://localhost:3333": {
        pairRootAddress: '0:ebcd0b451b83cd2f6dfaf197ef0aa9a38cd94981a340407c8d01c26671029cdc',
    },
    "https://devnet.tonswap.com": {
        pairRootAddress: '0:ebcd0b451b83cd2f6dfaf197ef0aa9a38cd94981a340407c8d01c26671029cdc',
    },
}