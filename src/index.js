import {TONClient} from 'ton-client-web-js';

window.TONClient = TONClient;

async function init(){
    let ton = await TONClient.create({
        servers: ['net.ton.dev']
    });
    console.log(ton.abi);
}

init();