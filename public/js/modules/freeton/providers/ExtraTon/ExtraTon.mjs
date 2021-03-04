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

//const Kington = require('../contracts/Kington.json');

/*
(async () => {

    const Kington = await ((await fetch('../contracts/Kington.json'))).json();

    console.log(Kington);

    const provider = new freeton.providers.ExtensionProvider(window.freeton);
    const contract = new freeton.Contract(provider, Kington.abi, Kington.networks['2'].address);
    console.log(contract);
    console.time('GETFROMTON')
    let messages;
    try {
        messages = await contract.functions.getMessages.runGet();
    } catch (e) {
        console.log(e);
    }
    console.timeEnd('GETFROMTON')
    console.log('MESSAGES', messages);
})()*/


class ExtraTon {
    constructor(options = {provider: window.freeton}) {
        this.options = options;
        this.provider = new freeton.providers.ExtensionProvider(options.provider);
    }

    getProvider() {
        return this.provider;
    }

    async initContract(abi, address) {
        return new Contract(await this.provider.getSigner(), abi, address);
    }

    async loadContract(contractJson, networkId = "1") {
        const Contract = await ((await fetch(contractJson))).json();
        return await this.initContract(Contract.abi, Contract.networks[networkId].address);
    }
}

export default ExtraTon;