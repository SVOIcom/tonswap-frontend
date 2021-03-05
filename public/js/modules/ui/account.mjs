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

import utils from '../utils.mjs';

let currentAccount = {publicKey: null};



const account = {
    setAccount: function (publicKey) {
        this.updateUIAccount(publicKey);
        currentAccount.publicKey = publicKey;
    },
    /**
     * Update account address in UI
     * @param shownAccount
     */
    updateUIAccount(shownAccount) {
        console.log(shownAccount);
        shownAccount = utils.shortenPubkey(shownAccount);
        $('.accountAddress').text(shownAccount);
    },

    /**
     * Update TON balance and explorer urls
     * @param wallet
     * @returns {Promise<void>}
     */
    async updateTONBalance(wallet) {
        $('.tonBalance').text((wallet.balance / 1000000000).toFixed(3) + ' TON');
        $('.tonBalance').attr('href', 'https://'+(await TON.getNetwork()).explorer+'/accounts/accountDetails?id='+wallet.address)
        $('.accountLink').attr('href', 'https://'+(await TON.getNetwork()).explorer+'/accounts/accountDetails?id='+wallet.address)
    }


}
export default account;