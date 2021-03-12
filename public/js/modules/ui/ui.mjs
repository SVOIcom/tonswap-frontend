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

    /**
     * Update exchange debouncer
     * @param {string} initiator
     * @returns {Promise<void>}
     */
    async updateExchange(initiator) {
        if(this.bounceTimer) {
            clearTimeout(this.bounceTimer);
        }
        this.bounceTimer = setTimeout(() => {
            this.updateView(initiator);
        }, 1000);
    }

    /**
     * Update exchange view
     * @param {string} initiator
     * @returns {Promise<void>}
     */
    async updateView(initiator = '') {

        //TODO initiator conversion

        $('.reverseExchange').hide();
        $('.exchangeLoader').show();
        $('.tokenFromBalanceDeposit, .tokenToBalanceDeposit, .tokenToBalanceWithdraw, .tokenFromBalanceWithdraw, .swapButton, .fromAmount, .toAmount').addClass('disabled').blur();


        let exchangeInfo = await this.getExchangeTokens();
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
                let exchangeRateForOne = await pairContract.getExchangeRate(exchangeInfo.from.rootAddress, 100);

                console.log('INITIATOR', initiator);
                //If initiator - from form
                if(initiator === 'from' || initiator === '') {
                    $('.toAmount').val(Number(exchangeRate.targetTokenAmount).toFixed(0));
                }

                //If initiator to form
                if(initiator === 'to') {
                    $('.fromAmount').val((Number(exchangeInfo.toAmount) / (Number(exchangeRateForOne.targetTokenAmount) / 100)).toFixed(0));
                    await this.updateView('from');
                    return;
                }

                $('.minimumReceived').text(`${utils.showToken(exchangeRate.targetTokenAmount)} ${exchangeInfo.to.symbol}`)
                $('.exchangeFee').text(`${utils.showToken(exchangeRate.fee)} ${exchangeInfo.to.symbol}`)

                $('.exchangeRate').text(`${utils.showToken(Number(exchangeRateForOne.targetTokenAmount) / 100)} ${exchangeInfo.to.symbol} per ${exchangeInfo.from.symbol}`)
                console.log(exchangeRate);

                $('.confirmFromLogo').attr('src', exchangeInfo.from.icon);
                $('.confirmToLogo').attr('src', exchangeInfo.to.icon);

                $('.confirmFromSymbol').text(exchangeInfo.from.symbol);
                $('.confirmToSymbol').text(exchangeInfo.to.symbol);

                $('.confirmFromAmount').text(exchangeInfo.fromAmount);
                $('.confirmToAmount').text(exchangeInfo.toAmount);

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

    /**
     * Init UI
     * @returns {Promise<UI>}
     */
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

        this.tokenHolderToInvest = new TokenHolder($('.tokenHolderToInvest'), this.tokensList);
        this.tokenHolderFromInvest = new TokenHolder($('.tokenHolderFromInvest'), this.tokensList);

        //Reverse button
        $('.reverseExchange').click(async () => {
            let newTokenTo = this.tokenHolderFrom.address;
            await this.tokenHolderFrom.setToken(this.tokenHolderTo.address);
            await this.tokenHolderTo.setToken(newTokenTo);

            let newToAmount = $('.fromAmount').val();
            $('.fromAmount').val($('.toAmount').val());
            $('.toAmount').val(newToAmount);

            await this.updateView();
        })

        //Handle token change
        tokenList.on('fromTokenChange', async (rootAddress) => {
            await this.tokenHolderFrom.setToken(rootAddress);
            await this.updateExchange('from');
        });

        tokenList.on('toTokenChange', async (rootAddress) => {
            await this.tokenHolderTo.setToken(rootAddress);
            await this.updateExchange('to');
        });

        tokenList.on('fromTokenInvestChange', async (rootAddress) => {
            await this.tokenHolderFromInvest.setToken(rootAddress);
            await this.updateAddLiquidityDebounced('from');
        });

        tokenList.on('toTokenInvestChange', async (rootAddress) => {
            await this.tokenHolderToInvest.setToken(rootAddress);
            await this.updateAddLiquidityDebounced('to');
        });

        //Handle amount change
        $('.fromAmount').keyup(async () => {
            await this.updateExchange('from');
        })
        $('.toAmount').keyup(async () => {
            await this.updateExchange('to');
        })

        $('.investFromAmount').keyup(async () => {
            await this.updateAddLiquidityDebounced('from');
        })
        $('.investToAmount').keyup(async () => {
            await this.updateAddLiquidityDebounced('to');
        })


        //Start swap button
        $('.swapButton').click(async () => {
            await this.startSwap();
        })

        //Finally swap
        $('.confirmSwap').click(async () => {
            await this.swap();
        })

        $('.liquidityBackButton').click(this.hideAddLiquidity);
        $('.addLiquidity').click(this.showAddLiquidity);

        $('.createPoolButton').click(async () => {
            await this.startAddToPool();
        })

        $('.acceptSupplyButton').click(async () => {
            await this.addPool();
        })

        //Auto update timer
        setInterval(async () => {
            await this.updateExchange();
        }, 30000);
        return this;
    }

    /**
     * Get exchange info
     * @returns {Promise<{fromAmount: (jQuery|string|*), toAmount: (jQuery|string|*), from: *, to: *}>}
     */
    async getExchangeTokens() {
        return {
            from: await this.tokenHolderFrom.getToken(),
            to: await this.tokenHolderTo.getToken(),
            fromAmount: Number($('.fromAmount').val()),
            toAmount: Number($('.toAmount').val())
        }
    }

    /**
     * Get invest info
     * @returns {Promise<{fromAmount: number, toAmount: number, from: *, to: *}>}
     */
    async getInvestTokens() {
        return {
            from: await this.tokenHolderFromInvest.getToken(),
            to: await this.tokenHolderToInvest.getToken(),
            fromAmount: Number($('.investFromAmount').val()),
            toAmount: Number($('.investToAmount').val())
        }
    }

    /**
     * Withdraw token
     * @param token
     * @param pairContract
     * @returns {Promise<void>}
     */
    async withdrawToken(token, pairContract) {

        let address = prompt(`Withdraw wallet address for ${token.symbol} token`);
        let amount = Number(prompt('Withdraw amount'));

        if(address !== '' && amount) {

            let waiter = await popups.waiting('Sending transaction...');

            try {
                let tx = await pairContract.withdrawTokens(token.rootAddress, address, amount);
                console.log(tx);
                await popups.error(`Transaction created<br>TXID: ${tx.transaction.id}`, '<i class="fas fa-wallet"></i>')
            } catch (e) {
                console.log(e);
                await popups.error('Error: ' + (e.message ? e.message : e.text));
            }

            waiter.hide();

        } else {
            await popups.error('Invalid address or amount');
        }
    }

    /**
     * Start swap popup
     * @returns {Promise<void>}
     */
    async startSwap() {
        let tokens = await this.getExchangeTokens();
        if(tokens.fromAmount <= 0 || tokens.toAmount <= 0) {
            await popups.error('You cannot transfer or receive 0 tokens');
            return;
        }

        let waiter = await popups.waiting('Processing data...');

        //Update data
        await this.updateView();

        waiter.hide();

        let popup = await popups.popup($('.popup-swap-confirm'));

        //Disappear popup
        let popupTimeout = setTimeout(() => {
            popup.hide();
            this.updateView();
        }, 10000);

        $('.confirmSwap').click(async () => {
            clearTimeout(popupTimeout);
            popup.hide();
        })

        console.log(popup);
    }

    /**
     * Fap fap swap swap
     * @returns {Promise<void>}
     */
    async swap() {
        let tokens = await this.getExchangeTokens();
        if(tokens.fromAmount <= 0 || tokens.toAmount <= 0) {
            await popups.error('You cannot transfer or receive 0 tokens');
            return;
        }

        let waiter = await popups.waiting('Swap...');


        try {
            let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
            /**
             *
             * @type {PairsRootContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            let swapResult = await pairContract.swap(tokens.from.rootAddress, tokens.fromAmount);
            console.log(swapResult);

            await popups.error(`Success!`, '<i class="fas fa-retweet"></i>');

        } catch (e) {
            console.log('SWAP ERROR', e);
            await popups.error(`Swap error: `);
        }

        await this.updateView();
        waiter.hide();
    }

    showAddLiquidity() {
        $('.exchange').fadeOut(500, () => {
            $('.liquidity').fadeIn(500);
        });

    }

    hideAddLiquidity() {
        $('.liquidity').fadeOut(500, () => {
            $('.exchange').fadeIn(500);
        });


    }

    async updateAddLiquidityDebounced(initiator) {
        if(this.bounceTimer) {
            clearTimeout(this.bounceTimer);
        }
        this.bounceTimer = setTimeout(() => {
            this.updateAddLiquidityView(initiator);
        }, 1000);
    }

    async updateAddLiquidityView(initiator = '') {
        $('.plusInLiquidity').hide();
        $('.liquidityLoader').show();
        $('.investToAmount, .investFromAmount, .createPoolButton').addClass('disabled');

        let tokens = await this.getInvestTokens();
        console.log(tokens);
        if(tokens.from && tokens.to) {
            try {
                let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);

                $('.addLiquidityPair').text(`${tokens.from.symbol}/${tokens.to.symbol}`)
                $('.addLiquidityFromLogo').attr('src', tokens.from.icon);
                $('.addLiquidityToLogo').attr('src', tokens.to.icon);

                $('.addLiquidityFromSymbol').text(tokens.from.symbol);
                $('.addLiquidityToSymbol').text(tokens.to.symbol);

                /**
                 *
                 * @type {PairsRootContract}
                 */
                let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);
                console.log('PAIR', pairContract);

                //More pair info we can get from pair
                //pairInfo = await pairContract.getPairInfo();


                console.log('INITIATOR', initiator);
                //If initiator - from form
                /* if(initiator === 'from' || initiator === '') {
                     $('.toAmount').val(Number(exchangeRate.targetTokenAmount).toFixed(0));
                 }

                 //If initiator to form
                 if(initiator === 'to') {
                     $('.fromAmount').val((Number(tokens.toAmount) / (Number(exchangeRateForOne.targetTokenAmount) / 100)).toFixed(0));
                     await this.updateView('from');
                     return;
                 }*/


                //User balances
                try {
                    let userBalances = await pairContract.getUserBalance();
                    $('.addLiquidityFromBalance').text(userBalances[tokens.from.rootAddress] + ' ' + tokens.from.symbol);
                    $('.addLiquidityToBalance').text(userBalances[tokens.to.rootAddress] + ' ' + tokens.to.symbol);
                } catch (e) {
                    console.log('BALANCE EXCEPTION', e);
                }

                //In pool balances
                try {
                    let userPairBalance = await pairContract.getUserLiquidityPoolBalance();
                    console.log('POOL BALANCES', userPairBalance);

                    $('.inPoolFromBalance').text(userPairBalance[tokens.from.rootAddress] + ' ' + tokens.from.symbol);
                    $('.inPoolToBalance').text(userPairBalance[tokens.to.rootAddress] + ' ' + tokens.to.symbol);
                } catch (e) {
                    console.log('POOL BALANCE EXCEPTION', e);
                }


            } catch (e) {
                $('.pairAddress').text('Pair not found');
                console.log('EXCEPTION', e);
            }
        }


        $('.investToAmount, .investFromAmount, .createPoolButton').removeClass('disabled');
        $('.plusInLiquidity').show();
        $('.liquidityLoader').hide();
    }

    /**
     * Confirm add to pool
     * @returns {Promise<void>}
     */
    async startAddToPool() {
        let tokens = await this.getInvestTokens();
        console.log(tokens);
        if(!((tokens.from && tokens.to) && (tokens.fromAmount && tokens.toAmount))) {
            await popups.error('Invalid token amount');
            return;
        }

        if(tokens.from.rootAddress === tokens.to.rootAddress) {
            await popups.error(`Can't add same token to pool`);
            return;
        }

        let waiter = await popups.waiting('Processing...');

        await this.updateAddLiquidityView();

        $('.addLiquidityFromAmount').text(tokens.fromAmount);
        $('.addLiquidityToAmount').text(tokens.toAmount);

        waiter.hide();

        let popup = await popups.popup($('.popup-creating-pool'));

        $('.acceptSupplyButton').click(async () => {
            popup.hide();
        })


        //data-popup="creating-pool"
    }


    /**
     * Supply
     * @returns {Promise<void>}
     */
    async addPool(){
        let tokens = await this.getInvestTokens();
        let waiter = await popups.waiting('Processing...');

        try{
            let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
            /**
             *
             * @type {PairsRootContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            let firstTokenAmount = 0;
            let secondTokenAmount = 0;

            if(pairInfo.tokenRoot1 === tokens.from.rootAddress){
                firstTokenAmount = tokens.fromAmount;
                secondTokenAmount = tokens.toAmount;
            }else{
                firstTokenAmount = tokens.toAmount;
                secondTokenAmount = tokens.fromAmount;
            }

            let supplyResult = await pairContract.provideLiquidity(firstTokenAmount, secondTokenAmount);

            console.log(supplyResult);
            console.log('PAIR', pairContract);

            await popups.error(`Success! Txid: ${supplyResult.txid}`,  '<i class="fas fa-retweet"></i>');

        }catch (e){
            console.log('Supply error', e);
            await popups.error(`Supply error: ${e.message}`);
        }

        await this.updateAddLiquidityView();

        waiter.hide();
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


