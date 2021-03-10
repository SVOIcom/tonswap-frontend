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


import TokenHolder from "./TokenHolder.mjs";
import TokensList from "../tonswap/TokensList.mjs";
import tokenList from "./tokenList.mjs";
import PairsRootContract from "../tonswap/contracts/PairsRootContract.mjs";
import utils from "../utils.mjs";
import SwapPairContract from "../tonswap/contracts/SwapPairContract.mjs";
import popups from "../popups/popups.mjs";

class UI extends EventEmitter3 {
    /**
     *
     * @param {ExtraTon} ton
     * @param {object} config
     */
    constructor(ton, config) {
        super();
        this.tokensList = null;
        this.ton = ton;
        this.config = config;
        this.bounceTimer = null;
    }

    async updateExchange() {
        if(this.bounceTimer) {
            clearTimeout(this.bounceTimer);
        }
        this.bounceTimer = setTimeout(() => {
            this.updateView();
        }, 1000);
    }

    async updateView() {


        $('.reverseExchange').hide();
        $('.exchangeLoader').show();
        $('.tokenFromBalanceDeposit, .tokenToBalanceDeposit, .tokenToBalanceWithdraw, .tokenFromBalanceWithdraw, .swapButton, .fromAmount, .toAmount').addClass('disabled').blur();


        let exchangeInfo = await this.getTokens();
        if(exchangeInfo.from && exchangeInfo.to) {
            try {
                let pairInfo = await this.swapRoot.getPairInfo(exchangeInfo.from.rootAddress, exchangeInfo.to.rootAddress);
                console.log(pairInfo);

                $('.pairAddress').text(utils.shortenPubkey(pairInfo.swapPairAddress));
                $('.pairAddress').attr('href', 'google.ru');

                /**
                 *
                 * @type {PairsRootContract}
                 */
                let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);
                console.log('PAIR', pairContract);

                //More pair info we can get from pair
                pairInfo = await pairContract.getPairInfo();

                //Set exchange rates
                let exchangeRate = await pairContract.getExchangeRate(exchangeInfo.from.rootAddress, exchangeInfo.fromAmount);
                let exchangeRateForOne = await pairContract.getExchangeRate(exchangeInfo.from.rootAddress, 1);

                $('.minimumReceived').text(`${utils.showToken(exchangeRateForOne.targetTokenAmount)} ${exchangeInfo.to.symbol}`)
                $('.exchangeFee').text(`${utils.showToken(exchangeRateForOne.fee)} ${exchangeInfo.to.symbol}`)

                $('.exchangeRate').text(`${utils.showToken(exchangeRateForOne.targetTokenAmount)} ${exchangeInfo.to.symbol} per ${exchangeInfo.from.symbol}`)
                console.log(exchangeRate);

                //User balances
                try {
                    let userBalances = await pairContract.getUserBalance();
                    $('.tokenFromBalance').text(userBalances[exchangeInfo.from.rootAddress] + ' ' + exchangeInfo.from.symbol);
                    $('.tokenToBalance').text(userBalances[exchangeInfo.to.rootAddress] + ' ' + exchangeInfo.to.symbol);

                    $('.tokenFromBalanceDeposit').off('click');
                    $('.tokenFromBalanceDeposit').click(() => {
                        let tokenAddress = pairInfo.tokenRoot1 === exchangeInfo.from.rootAddress ? pairInfo.tokenWallet1 : pairInfo.tokenWallet2;
                        popups.error(`Deposit ${exchangeInfo.from.symbol} token to pair by transferring  to this address: <br> ${tokenAddress}`, '<i class="fas fa-wallet"></i>')
                    });


                    $('.tokenFromBalanceWithdraw').off('click');
                    $('.tokenFromBalanceWithdraw').click(async () => {
                        await this.withdrawToken(exchangeInfo.from, pairContract);
                    });

                    $('.tokenToBalanceWithdraw').off('click');
                    $('.tokenToBalanceWithdraw').click(async () => {
                        await this.withdrawToken(exchangeInfo.to, pairContract);
                    });

                    $('.tokenFromBalanceDeposit').parent().show();
                    $('.tokenToBalanceDeposit').parent().show();
                    $('.tokenToBalanceWithdraw').parent().show();
                    $('.tokenFromBalanceWithdraw').parent().show();

                } catch (e) {
                    $('.tokenFromBalanceDeposit').parent().hide();
                    $('.tokenToBalanceDeposit').parent().hide();
                    $('.tokenToBalanceWithdraw').parent().hide();
                    $('.tokenFromBalanceWithdraw').parent().hide();
                    console.log('BALANCE EXCEPTION', e);
                }


                $('.tokenFromBalanceDeposit, .tokenToBalanceDeposit, .tokenToBalanceWithdraw, .tokenFromBalanceWithdraw, .swapButton, .fromAmount, .toAmount').removeClass('disabled').focus();

            } catch (e) {
                $('.pairAddress').text('Pair not found');
                console.log('EXCEPTION', e);
            }
        }

        $('.reverseExchange').show();
        $('.exchangeLoader').hide();

        this.emit('exchangeChange');
    }

    async init() {
        //Init contracts
        this.swapRoot = await new PairsRootContract(this.ton, this.config).init();


        //Load tokens list
        this.tokensList = await new TokensList().load();
        console.log(await this.tokensList.getTokens());

        //Load tokens lists on page
        tokenList.load(await this.tokensList.getTokens());

        //Initialize token holders
        this.tokenHolderFrom = new TokenHolder($('.tokenHolderFrom'), this.tokensList);
        this.tokenHolderTo = new TokenHolder($('.tokenHolderTo'), this.tokensList);

        //Reverse button
        $('.reverseExchange').click(async () => {
            let newTokenTo = this.tokenHolderFrom.address;
            await this.tokenHolderFrom.setToken(this.tokenHolderTo.address);
            await this.tokenHolderTo.setToken(newTokenTo);

            let newToAmount = $('.fromAmount').val();
            $('.fromAmount').val($('.toAmount').val());
            $('.toAmount').val(newToAmount);

            await this.updateExchange();
        })

        //Handle token change
        tokenList.on('fromTokenChange', async (rootAddress) => {
            await this.tokenHolderFrom.setToken(rootAddress);
            await this.updateExchange();
        });

        tokenList.on('toTokenChange', async (rootAddress) => {
            await this.tokenHolderTo.setToken(rootAddress);
            await this.updateExchange();
        });

        //Handle amount change
        $('.fromAmount,.toAmount').keyup(async () => {
            await this.updateExchange();
        })

        return this;
    }

    /**
     * Get exchange info
     * @returns {Promise<{fromAmount: (jQuery|string|*), toAmount: (jQuery|string|*), from: *, to: *}>}
     */
    async getTokens() {
        return {
            from: await this.tokenHolderFrom.getToken(),
            to: await this.tokenHolderTo.getToken(),
            fromAmount: Number($('.fromAmount').val()),
            toAmount: Number($('.toAmount').val())
        }
    }

    async withdrawToken(token, pairContract) {

        let address = prompt(`Withdraw wallet address for ${token.symbol} token`);
        let amount = Number(prompt('Withdraw amount'));

        if(address !== ''  && amount) {

            let waiter = await popups.waiting('Sending transaction...');

            try {
                let tx = await pairContract.withdrawTokens(token.rootAddress, address, amount);
                console.log(tx);
                await popups.error(`Transaction created<br>${JSON.stringify(tx)}`, '<i class="fas fa-wallet"></i>')
            } catch (e) {
                console.log(e);
                await popups.error('Error: ' + (e.message ? e.message : e.text));
            }

            waiter.hide();

        } else {
            await popups.error('Invalid address or amount');
        }
    }
}

/**
 * UI factory
 * @type {{initialize(): Promise<UI>}}
 */
const ui = {
    async initialize(TON, config) {
        return await new UI(TON, config).init();
    }
};

export default ui;


