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

import darkside from './modules/darkside.mjs';
import popups from './modules/popups/popups.mjs';
import {default as globalize} from './modules/provideGlobal.mjs';
import messages from "./modules/messages/messages.mjs";


/**
 * Provide elements visibility
 */
//Make dark theme controller globally
globalize.makeVisible(darkside, 'darkside');

//Make popups visible globally
globalize.makeVisible(popups, 'popups');

/**
 * Configuration
 */
//Disable dark theme if white enabled
if(!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    darkside.makeLight();
}

setInterval(async () => {
    let a = messages.show({
        theme: messages.THEMES.none,
        type: messages.TYPES.simple,
        title: Math.random(),
        text: Math.random(),
        timeout: 500000,
        buttons: [
            messages.button('Привет', () => {
                alert('Привет')
            }),
            messages.button('мир', () => {
                alert('мир')
            }),
        ]
    });


}, 5000)
