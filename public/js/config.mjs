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
    //Test network config
    test: {
        pairRootAddress: '0:df6eaef1911a63490b56fa087c6bec4e39daf3986359da52aa2af83a6e22959b',
    },
    //Main network config
    main: {
        pairRootAddress: '0:',
    },

    //Locals dev networks config
    local: {
        pairRootAddress: '0:17ee239a8641ae14da6e055ca5f3fd0fd28522fd26d1d50d36b7cf743d9425b0',
    },
    "http://localhost:3333": {
        pairRootAddress: '0:17ee239a8641ae14da6e055ca5f3fd0fd28522fd26d1d50d36b7cf743d9425b0',
    },
    "https://devnet.tonswap.com": {
        pairRootAddress: '0:17ee239a8641ae14da6e055ca5f3fd0fd28522fd26d1d50d36b7cf743d9425b0',
    },

    //Server address used by default
    defaultNetworkServer: 'https://devnet.tonswap.com',
    //Name of network used by default
    defaultNetwork: 'local',

    //Disable browser extension
    disableExtraTON: false
}