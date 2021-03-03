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
    }
}
export default popups;