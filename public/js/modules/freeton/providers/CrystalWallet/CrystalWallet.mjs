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

 import freeton from "/modules/freeton/index.js";
 import Contract from "./Contract.mjs";
 import utils from "../../../utils.mjs";

import ton, { hasTonProvider, Address } from './ton-inpage-provider/dist/index.js';

 const NETWORKS = {
     main: 'main2.ton.dev',
     test: 'net.ton.dev'
 };
 
 const REVERSE_NETWORKS = {
     'main.ton.dev': 'main',
     'main2.ton.dev': 'main',
     'net.ton.dev': 'test'
 }
 
 const EXPLORERS = {
     test: 'net.ton.live',
     main: 'main.ton.live',
     local: 'main.ton.live',
 }


 /**
  * CrystalWallet provider class
  */
 class CrystalWallet extends EventEmitter3 {
     constructor(options = {network: 'main',
                            networkServer: 'main2.ton.dev',}) {

         super();
         this.options = options;
         this.provider = null;
         this.ton = null
         this.networkServer = options.networkServer;
         this.pubkey = null;
 
         this.walletContract = null;
         this.walletBalance = 0;
 
         this.network = options.network;
 
     }

     /**
      * Initialize CrystalWallet provider
      * @returns {Promise<ExtraTon>}
      */
     async init() {

         //Detect is CrystallWallet exists
         if (!(await hasTonProvider())) {
            throw new Error('CrystallWallet extension not found')
          }
        await ton.ensureInitialized();
        
        this.provider = await window.getTONWeb();

        this.provider = ton

        this.getPermissions();

        console.log((await ton.getProviderState()));

         return this;
     }

     async getPermissions(permissions = ['tonClient', 'accountInteraction']) {
        let { accountInteraction } = await ton.rawApi.requestPermissions({
            permissions: permissions
        });
        if (accountInteraction == null) {
            throw new Error('Insufficient permissions')
        };

        return accountInteraction
     }

     /**
      * Get raw extraTON provider
      * @returns {*}
      */
     getProvider() {
         return this.provider;
     }

     /**
      * Get TON client
      * @returns {TONClient}
      */
     getTONClient() {
         return this.ton;
     }

     /**
      * Get keypair as possible
      * @returns {Promise<{public: *, secret: null}>}
      */
     async getKeypair() {

        let publicKey = (await this.provider.getProviderState()).permissions.accountInteraction.publicKey

         return {public: publicKey, secret: null};
     }

     async getWallet() {

        let wallet = {}

        let address = (await this.provider.getProviderState()).permissions.accountInteraction.address._address

        wallet.address = address;

        if(wallet.address) {

            if(!this.walletContract) {
                this.walletContract = await this.loadContract('/contracts/abi/SafeMultisigWallet.abi.json', wallet.address);
            }
            //Load user wallet (potentially compatible with SafeMiltisig)
            wallet.contract = this.walletContract;
            wallet.balance = await this.walletContract.getBalance();
        }

         return wallet;
     }

     async getCurrentNetwork() {

        let currentNetwork = (await this.provider.getProviderState()).selectedConnection

         return currentNetwork;
     }

     /**
      * Make wallet transfer
      * @param to
      * @param amount
      * @param payload
      * @param bounce //bool
      * @returns {Promise<*>}
      */
     async walletTransfer(to, amount, payload = '', bounce = true) {

        // let parsedPayload = JSON.parse(payload);

        let walletAddress = this.getWalletAddress();


        // sendMessageExample
        // {
        //     sender: selectedAddress,
        //         recipient: recipientAddress,
        //             amount: '10500000000',
        //                 bounce: true,
        //                     payload: {
        //         abi: Abi,
        //         method: 'Stake',
        //         params: {
        //             stake: '10000000000'
        //         }
        //     }
        // };


        const { transaction } = await this.provider.rawApi.sendMessage({
            sender: Address(walletAddress),
            recipient: Address(to),
            amount: amount,
            bounce: bounce,
            payload: payload

          });

         return transaction
     }

    
 }

 
 export default CrystalWallet;