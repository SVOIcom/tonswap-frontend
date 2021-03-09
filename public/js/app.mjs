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
import {default as getProvider, PROVIDERS} from "./modules/freeton/getProvider.mjs";
import updater from "./modules/ui/updater.mjs";
import TokensList from "./modules/tonswap/TokensList.mjs";
import searchList from "./modules/ui/searchList.mjs";
import CONFIG from "./config.mjs";


let currentNetworkAddress = '';


//Go async
(async () => {

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

    let loadingPopup = await popups.waiting('Initialize...');

    /**
     * Initialize TON
     * @type {ExtraTon}
     */
    let TON = null;
    try {
        TON = await getProvider().init();
        $('.connectExtratonButton').hide();

        $('.connectWalletButton').hide();
        $('.swapButton').show();
        $('.connectSeed').hide();

    } catch (e) {
        await popups.error('It seems the extraTON browser extension was not found. We strongly recommend using extraTON as your FreeTON connection provider. However, you can use your private key directly.');
        TON = await getProvider(undefined, PROVIDERS.TonWeb).init();

        $('.connectedWithExtraTon').hide();
        $('.installExtraton').show();
        $('.connectSeed').show();

        $('.connectSeed').click(async () => {
            await popups.getKeys();
        });

        $('.connectExtratonButton').click(async () => {
            try {
                //If extraTON connected make reload
                TON = await getProvider().init();
                document.location.reload();
            } catch (e) {
                await popups.error('It seems the extraTON browser extension was not found. We strongly recommend using extraTON as your FreeTON connection provider. However, you can use your private key directly.');
            }
        });
    }

    globalize.makeVisible(TON, 'TON');

    //Start UI updater
    await updater.start(TON);

    //Detect if network changed
    TON.on('networkChanged', async (networkServer, previousNetworkServer) => {

        if(currentNetworkAddress === networkServer) {
            return;
        }
        await popups.error('Detect network change. Change the network back or the page will reload.');
        console.log(previousNetworkServer, networkServer);
        if((await TON.getNetwork()).server !== previousNetworkServer) {
            window.location.reload();
        }
        currentNetworkAddress = networkServer;
    });
    currentNetworkAddress = (await TON.getNetwork()).server;


    //Load tokens list
    const TOKENS = await new TokensList().load();
    console.log(await TOKENS.getTokens());

    searchList.load(await TOKENS.getTokens());

    //Initialize dialog hide
    loadingPopup.hide();


    let Root = await TON.loadContract('/contracts/abi/RootSwapPairContract.abi.json', CONFIG[TON.network].pairRootAddress);
    window.Root = Root;
    //await Root.getPairInfo({tokenRootContract1:"0:8b8ea2231d4bee5b57c18df60ea122f145663ef79a797ce6739aa9ffa9c7ed72",tokenRootContract2:"0:624865d9a0c8c2e1d3c52223eb04738ce32bff138e95950e02b3b55f2aa89739"})


    let KingTonContract = await TON.loadContractFrom('/contracts/Kington.json', "2");
    /*let GiverContract = await TON.loadContractFrom('/contracts/Giver.json', "2");*/
    /*let tonlabs = await TON.loadContractFrom('/contracts/TonlabsGiver.json', "1");
    console.log(tonlabs);
    console.log(await tonlabs.sendTransaction({dest:"0:bb0a6daa36d2fdcdb78edd8091140e05b9b92656b0c441669ac176cccbf1909e", value:2000000000, bounce:true}))
*/

    console.log(KingTonContract);
    //console.log(await KingTonContract.addMessage({message:123124}))
    console.log(await KingTonContract.getMessages());
    //console.log(await KingTonContract.getMessages.deploy());

    //console.log(GiverContract);
    //console.log(await KingTonContract.getMessages())
    //console.log(await KingTonContract.getMessages.deploy())
    //console.log(await GiverContract.grant.deploy({addr:"0:bb0a6daa36d2fdcdb78edd8091140e05b9b92656b0c441669ac176cccbf1909e"}))
    /*console.log(await KingTonContract.addMessage.deploy({
               dest: '0:bbab3302726f352371676aa889ea69e155e385c3e3e4c9fb85a5c3b64ccca60c',
               value: '1000000000',
               bounce: false,
               allBalance: false,
               payload: 'te6ccgEBAgEADgABCAAAAAABAApIZWxsbw==',
             }))*/

})()