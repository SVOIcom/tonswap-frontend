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
import {default as getProvider, PROVIDERS, UTILS} from "https://tonconnect.svoi.dev/freeton/getProvider.mjs";
import ui from "./modules/ui/ui.mjs";
import updater from "./modules/ui/updater.mjs";
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
   /* if(!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        darkside.makeLight();
    }*/

    let loadingPopup = await popups.waiting('Initialize...');

    /**
     * Disconnect wallets
     * @returns {Promise<void>}
     */
    window.disconnectWallet = async function () {
        delete localStorage.wallet;
        await TON.revokePermissions();
        window.location.href = window.location.href;
        window.location.reload();
    }

    /**
     * Connect crystalWallet
     * @returns {Promise<void>}
     */
    window.connectCrystalWallet = async function () {
        localStorage.wallet = PROVIDERS.CrystalWallet;
        window.location.href = window.location.href;
        window.location.reload();
    }

    /**
     * Connect TonWallet
     * @returns {Promise<void>}
     */
    window.connectTonWallet = async function () {
        localStorage.wallet = PROVIDERS.TonWallet;
        window.location.href = window.location.href;
        window.location.reload();
    }

    window.connectTonWeb = async function () {
        localStorage.wallet = PROVIDERS.TonWeb;
        window.location.href = window.location.href;
        window.location.reload();
    }


    /**
     * Initialize TON
     * @type {TonWallet}
     */
    let TON = null;
    try {

        if(!localStorage.wallet) {
            throw 'NoWalletSelected';
        }

        //Initialize provider
        TON = await getProvider({}, localStorage.wallet)//.init();
        await TON.requestPermissions();
        await TON.start();

        let wallet = await TON.getWallet();

        $('.accountAddress').text(UTILS.shortenPubkey(wallet.address));
        $('.header__account-icon').css('background-image',`url(${TON.getIconUrl()})`)
        //$('#connectWalletButton').html(`<img src="${TON.getIconUrl()}" style="height: 30px;"> &nbsp;` + utils.shortenPubkey(wallet.address));

        $('.connectWalletButton').hide();
        $('.swapButton, .createPoolButton').show();
        $('.connectSeed').hide();

    } catch (e) {
        console.log(e);
        TON = await getProvider({
            network: CONFIG.defaultNetwork,
            networkServer: CONFIG.defaultNetworkServer
        }, PROVIDERS.TonBackendWeb);
        await TON.requestPermissions();
        await TON.start();


        $('.connectedWithExtraTon').hide();
        $('.installExtraton').show();
        $('.connectSeed').show();

        $('.connectSeed').click(async () => {
            await popups.getKeys();

            $('.connectWalletButton').hide();
            $('.swapButton, .createPoolButton').show();
        });



    }

    /**
     * Initialize TON
     * @type {TonWallet}
     */
    /*let TON = null;
    try {

        TON = await getProvider().init();
        try {
            if(await TON.provider.extension.getVersion() < TON_WALLET_MIN_VERSION) {
            throw 'InvalidVersion';
            }
        }catch (e) {
            await popups.error(`It seems you use TONWallet older than ${TON_WALLET_MIN_VERSION} version. Please, update your TONWallet before using SWAP. <br><br><a href="https://tonwallet.io" target="_blank" style="text-decoration: underline">Get TONWallet now</a>`);
        }
        $('.connectExtratonButton').hide();

        $('.connectWalletButton').hide();
        $('.swapButton, .createPoolButton').show();
        $('.connectSeed').hide();

    } catch (e) {
        console.log(e);
        if(!CONFIG.disableTONWallet) {
            await popups.error('It seems the TONWallet browser extension was not found. TONWallet required for FreeTON connection. <br><br><a href="https://tonwallet.io" target="_blank" style="text-decoration: underline">Get TONWallet now</a>');
        }
        TON = await getProvider({
            network: CONFIG.defaultNetwork,
            networkServer: CONFIG.defaultNetworkServer
        }, PROVIDERS.TonWeb).init();



        $('.connectedWithExtraTon').hide();
        $('.installExtraton').show();
        $('.connectSeed').show();

        $('.connectSeed').click(async () => {
            await popups.getKeys();

            $('.connectWalletButton').hide();
            $('.swapButton, .createPoolButton').show();
        });

        $('.connectExtratonButton').click(async () => {
            try {
                //If TONWallet connected make reload
                TON = await getProvider().init();
                document.location.reload();
            } catch (e) {
                await popups.error('It seems the TONWallet browser extension was not found. TONWallet required for FreeTON connection. <br><br><a href="https://tonwallet.io" target="_blank" style="text-decoration: underline">Get TONWallet now</a>');
            }
        });


    }*/
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


    //Initialize UI
    /**
     *
     * @type {UI}
     */
    const UI = await ui.initialize(TON, CONFIG[TON.network]);

    UI.on('exchangeChange', async () => {
        console.log(await UI.getExchangeTokens())
    })


    //Initialize dialog hide
    loadingPopup.hide();

    //TonWallet bug workaround
    try {
        await TON.provider.setServers(TON.networkServer)
    }catch (e) {
    }

})()