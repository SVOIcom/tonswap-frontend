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
        pairRootAddress: '0:3dc2f941650dbb757e47363109841a943c04a4824a6652b8be7377b945603137',
    },
    //Main network config
    main: {
        pairRootAddress: '0:fcf5a5b14ad033b07a24df255baa12601905a788f6bdc326fd6680d1366c9d6e',
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
    defaultNetworkServer: 'main.ton.dev',
    //Name of network used by default
    defaultNetwork: 'main',

    //Disable browser extension
    disableTONWallet: false
}