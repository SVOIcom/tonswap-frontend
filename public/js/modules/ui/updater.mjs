/*_______ ____  _   _  _____
 |__   __/ __ \| \ | |/ ____|
    | | | |  | |  \| | (_____      ____ _ _ __
    | | | |  | | . ` |\___ \ \ /\ / / _` | '_ \
    | | | |__| | |\  |____) \ V  V / (_| | |_) |
    |_|  \____/|_| \_|_____/ \_/\_/ \__,_| .__/
                                         | |
                                         |_| */
import account from "./account.mjs";

/**
 * @name TONSwap project - tonswap.com
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


/**
 * Interface updater
 * @type {{start(*): Promise<void>, updateAccount(): Promise<void>, TON: null, timer: null}}
 */
const updater = new (class Updater extends EventEmitter3 {
    constructor() {
        super();
        this.TON = null;
        this.timer = null;
    }

    /**
     * Start updater
     * @param TON
     * @returns {Promise<void>}
     */
    async start(TON) {
        this.TON = TON;

        await this.updateAccount();

        //If pubkey changed update account
        this.TON.on('pubkeyChanged', () => {
            this.updateAccount();
        })

        //If network changed
        this.TON.on('networkChanged', () => {
            this.updateAccount();
        })

        //If balance changed
        //await  account.updateTONBalance(await this.TON.getWallet());
        /*this.TON.on('balanceChanged', (newBalance, wallet) => {
            account.updateTONBalance(wallet);
        })*/

        this.timer = setInterval(async () => {
            $('.serverTime').text((new Date(await this.TON.ton.serverNow())).toUTCString() + ' ' + this.TON.networkServer + ':' + this.TON.network);
        }, 1000);
    }

    /**
     * Update user account
     * @returns {Promise<void>}
     */
    async updateAccount() {
        let tonAccount = await this.TON.getKeypair();
        /* let tonWallet = await this.TON.getWallet();
         console.log(tonWallet);*/
        account.setAccount(tonAccount.public);
    }
});
export default updater;