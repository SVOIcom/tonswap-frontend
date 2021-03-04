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
import ExtraTon from "./modules/freeton/providers/ExtraTon/ExtraTon.mjs";


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

(async () => {
    let TON = new ExtraTon();
    let KingTonContract = await TON.loadContract('/contracts/Kington.json', "2");
    let GiverContract = await TON.loadContract('/contracts/Giver.json', "2");
    //console.log(KingTonContract);
    console.log(GiverContract);
    //console.log(await KingTonContract.getMessages())
    //console.log(await KingTonContract.getMessages.deploy())
    console.log(await GiverContract.grant.deploy({addr:"0:bb0a6daa36d2fdcdb78edd8091140e05b9b92656b0c441669ac176cccbf1909e"}))
    /*console.log(await KingTonContract.addMessage.deploy({
               dest: '0:bbab3302726f352371676aa889ea69e155e385c3e3e4c9fb85a5c3b64ccca60c',
               value: '1000000000',
               bounce: false,
               allBalance: false,
               payload: 'te6ccgEBAgEADgABCAAAAAABAApIZWxsbw==',
             }))*/

})()