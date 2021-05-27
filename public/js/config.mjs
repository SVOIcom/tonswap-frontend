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
        pairRootAddress: '0:0daaca36b1d25699eaa0f40276830d2b263d9db41dfe590c2eb13a145a3caf6a',
    },
    //Main network config
    main: {
        pairRootAddress: '0:',
    },

    //Locals dev networks config
    local: {
        pairRootAddress: '',
    },
    "http://localhost:3333": {
        pairRootAddress: '',
    },
    "https://devnet.tonswap.com": {
        pairRootAddress: '',
    },

    /*
    //Server address used by default
    defaultNetworkServer: 'https://devnet.tonswap.com',
    //Name of network used by default
    defaultNetwork: 'local',   */



//Server address used by default
    defaultNetworkServer: 'net.ton.dev',
    //Name of network used by default
    defaultNetwork: 'test',

    //Disable browser extension
    disableTONWallet: false
}