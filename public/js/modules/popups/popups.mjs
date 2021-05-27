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

import {default as Popup} from './Popup.mjs';
import {default as templates} from './popups_templates.mjs';
import Account, {SEED_LENGTH} from "../freeton/providers/TonWeb/Account.mjs";


const popups = {
    /**
     * Open popup by name
     * @param {string} name
     * @param {object} options
     * @returns {Promise<unknown>}
     */
    popupName: async function (name, options = {}) {
        return await this.popup($('.popup-' + name), options);
    },
    /**
     * Open popup by element
     * @param {string|object} popup
     * @param {object} options
     * @returns {Promise<*>}
     */
    popup: async function (popup, options = {}) {
        let pop = new Popup(popup, options);
        await pop.show();
        return pop;
    },

    /**
     * Create error popup and wait for close
     * @param {string} error
     * @param {string} icon
     * @returns {Promise<*>}
     */
    error: function (error = 'Oops! Some error returned', icon = undefined) {
        return new Promise((async resolve => {
            let popup = await this.popup((templates.error(error, icon)), {
                afterClose: () => {
                    resolve(popup);
                }
            });
        }))
    },

    /**
     * Transaction subbmited popup
     * @param {string} title
     * @param {{text: {string},href: {string}}|undefined} url
     * @param {string} icon
     * @returns {Promise<unknown>}
     */
    transactionSubmitted: function (title = 'Success!', url = {
        text: undefined,
        href: '#'
    }, icon = undefined) {
        return new Promise((async resolve => {
            let popup = await this.popup((templates.transactionSubmitted(title, url, icon)), {
                afterClose: () => {
                    resolve(popup);
                }
            });
        }))
    },

    /**
     * Waiting spinner dialog
     * @param {string} title
     * @param {string} subtext
     * @param {string} subtext2
     * @returns {Promise<*>}
     */
    waiting: function (title = '', subtext = '', subtext2 = '') {
        return new Promise((async resolve => {
            let popup = await this.popup((templates.waiting(title, subtext, subtext2)), {
                buttons: [], modal: true
            });
            resolve(popup);
        }))
    },
    getKeys: function () {
        return new Promise((async resolve => {
            let popup = await this.popup((templates.getKeys()), {});
            //resolve(popup);

            $('#applyKeysButton').click(async () => {
                let publicKey = $('#publicKeyInput').val().trim();
                let seedOrKey = $('#seedPhraseInput').val().trim();
                let walletAddressInput = $('#walletAddressInput').val().trim();

                let testAccount = null;

                if(seedOrKey.split(' ').length === 12) {
                    testAccount = new Account(TON.ton, publicKey, seedOrKey, SEED_LENGTH.w12);
                } else if(seedOrKey.split(' ').length === 24) {
                    testAccount = new Account(TON.ton, publicKey, seedOrKey, SEED_LENGTH.w24);
                } else {
                    testAccount = new Account(TON.ton, publicKey, seedOrKey, SEED_LENGTH.private);
                }

                try {
                    let publicKeyGenerated = await testAccount.getPublic();
                    if(publicKeyGenerated !== publicKey) {
                        throw  new Error('The public key of the seed phrase does not match the specified public key')
                    }

                    if(walletAddressInput.trim().length === 0) {
                        throw  new Error('Invalid multisig wallet address');
                    }


                    await TON.acceptAccount(publicKey, seedOrKey, testAccount.seedLength);
                    await TON.acceptWallet(walletAddressInput);
                    alert('Key accepted');
                    resolve();
                    popup.hide();

                } catch (e) {
                    await this.error(`Failed to use the specified key: ${e.message}`);
                }
            });

        }))
    }
}
export default popups;