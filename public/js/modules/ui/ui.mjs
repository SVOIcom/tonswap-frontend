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
import TokenRootContract from "../tonswap/contracts/TokenRootContract.mjs";
import TokenWalletContract from "../tonswap/contracts/TokenWalletContract.mjs";

class UI extends EventEmitter3 {
    /**
     *
     * @param {TonWallet} ton
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
                $('.pairAddress').attr('href', '');

                /**
                 *
                 * @type {PairsRootContract}
                 */
                let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);
                console.log('PAIR', pairContract);

                await this._updateUserTonBalance(pairContract);

                //More pair info we can get from pair
                pairInfo = await pairContract.getPairInfo();

                //Set exchange rates
                let exchangeRate = await pairContract.getExchangeRate(exchangeInfo.from.rootAddress, utils.numberToUnsignedNumber(exchangeInfo.fromAmount, exchangeInfo.from.decimals));
                let exchangeRateForOne = await pairContract.getExchangeRate(exchangeInfo.from.rootAddress, 1000000000);

                console.log('INITIATOR', initiator);
                //If initiator - from form
                if(initiator === 'from' || initiator === '') {
                    $('.fromAmount').val(Number($('.fromAmount').val()).toFixed(exchangeInfo.from.decimals));
                    $('.toAmount').val(utils.showToken(utils.unsignedNumberToSigned(exchangeRate.targetTokenAmount, exchangeInfo.to.decimals)));
                }

                //If initiator to form
                if(initiator === 'to') {
                    $('.fromAmount').val(utils.showToken(Number(exchangeInfo.toAmount) / utils.unsignedNumberToSigned(Number(exchangeRateForOne.targetTokenAmount) / 1000000000)));
                    await this.updateView('from');
                    return;
                }

                $('.minimumReceived').text(`${utils.unsignedNumberToSigned(exchangeRate.targetTokenAmount, exchangeInfo.to.decimals)} ${exchangeInfo.to.symbol}`)
                $('.exchangeFee').text(`${utils.unsignedNumberToSigned(exchangeRate.fee, exchangeInfo.from.decimals)} ${exchangeInfo.from.symbol}`)

                $('.exchangeRate').text(`${utils.showToken(utils.unsignedNumberToSigned(Number(exchangeRateForOne.targetTokenAmount) / 1000000000, exchangeInfo.to.decimals))} ${exchangeInfo.to.symbol} per ${exchangeInfo.from.symbol}`)
                console.log(exchangeRate);

                $('.confirmFromLogo').attr('src', exchangeInfo.from.icon);
                $('.confirmToLogo').attr('src', exchangeInfo.to.icon);

                $('.confirmFromSymbol').text(exchangeInfo.from.symbol);
                $('.confirmToSymbol').text(exchangeInfo.to.symbol);

                $('.confirmFromAmount').text(((exchangeInfo.fromAmount)));
                $('.confirmToAmount').text(((exchangeInfo.toAmount)));

                //User balances
                try {

                    //Init tokens root contracts
                    const getterToken = await new TokenRootContract(this.ton, this.config).init(exchangeInfo.to.rootAddress);
                    const senderToken = await new TokenRootContract(this.ton, this.config).init(exchangeInfo.from.rootAddress);

                    //Get sender and getter wallets token wallet
                    const tokenSenderWallet = await new TokenWalletContract(this.ton, this.config).init(await senderToken.getWalletAddress());
                    const tokenGetterWallet = await new TokenWalletContract(this.ton, this.config).init(await getterToken.getWalletAddress());


                    $('.tokenFromBalance').text(utils.unsignedNumberToSigned(await tokenSenderWallet.getBalance(), exchangeInfo.from.decimals));
                    $('.tokenToBalance').text(utils.unsignedNumberToSigned(await tokenGetterWallet.getBalance(), exchangeInfo.to.decimals));

                } catch (e) {
                    $('.tokenFromBalance').text(0);
                    $('.tokenToBalance').text(0);

                    console.log('BALANCE EXCEPTION', e);
                }


                $('.tokenFromBalanceDeposit, .tokenToBalanceDeposit, .tokenToBalanceWithdraw, .tokenFromBalanceWithdraw, .swapButton, .fromAmount, .toAmount').removeClass('disabled').focus();

            } catch (e) {
                $('.pairAddress').text('Pair not found');
                $('.fromAmount, .toAmount').removeClass('disabled').focus();
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
        this.tokensList = await new TokensList(undefined, this.ton).load(this.ton.network);
        console.log(await this.tokensList.getTokens());

        //Load tokens lists on page
        tokenList.load(await this.tokensList.getTokens());

        //Initialize token holders
        this.tokenHolderFrom = new TokenHolder($('.tokenHolderFrom'), this.tokensList, this.ton);
        this.tokenHolderTo = new TokenHolder($('.tokenHolderTo'), this.tokensList, this.ton);

        this.tokenHolderToInvest = new TokenHolder($('.tokenHolderToInvest'), this.tokensList, this.ton);
        this.tokenHolderFromInvest = new TokenHolder($('.tokenHolderFromInvest'), this.tokensList, this.ton);

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

        $('.fromAmount').change(async () => {
            await this.updateExchange('from');
        })
        $('.toAmount').change(async () => {
            await this.updateExchange('to');
        })

        $('.investFromAmount').keyup(async () => {
            await this.updateAddLiquidityDebounced('from');
        })
        $('.investToAmount').keyup(async () => {
            await this.updateAddLiquidityDebounced('to');
        })
        $('.investFromAmount').change(async () => {
            await this.updateAddLiquidityDebounced('from');
        })
        $('.investToAmount').change(async () => {
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

        //Liquidity buttons
        $('.liquidityBackButton').click(this.hideAddLiquidity);
        $('.addLiquidity').click(this.showAddLiquidity);

        $('.createPoolButton').click(async () => {
            await this.startAddToPool();
        });

        $('.acceptSupplyButton').click(async () => {
            await this.addPool();
        });

        $('.liquidityWithdrawButton').click(async () => {
            await this.withdrawFromPool();
        });

        $('.createPairButton').click(async () => {
            await this.createNewPair();
        });

        //Ton management
        $('.tonBalance').parent().click(async (e) => {
            e.preventDefault();
            await this.sendTON()
        })

        //Auto update timer
        setInterval(async () => {
            await this.updateExchange();
        }, 30000);


        $('.accountLink').attr('href', 'https://' + (await this.ton.getNetwork()).explorer + '/accounts/accountDetails?id=' + (await this.ton.getWallet()).address);

        return this;


    }

    /**
     * Get exchange info
     * @returns {Promise<{fromAmount: (jQuery|string|*), toAmount: (jQuery|string|*), from: *, to: *}>}
     */
    async getExchangeTokens() {
        let tokenFrom = await this.tokenHolderFrom.getToken();
        let tokenTo = await this.tokenHolderTo.getToken();

        return {
            from: tokenFrom,
            to: tokenTo,
            fromAmount: Number(Number($('.fromAmount').val())),
            toAmount: Number(Number($('.toAmount').val()))
        }
    }

    /**
     * Get invest info
     * @returns {Promise<{fromAmount: number, toAmount: number, from: *, to: *}>}
     */
    async getInvestTokens() {
        let tokenFrom = await this.tokenHolderFromInvest.getToken();
        let tokenTo = await this.tokenHolderToInvest.getToken();

        return {
            from: tokenFrom,
            to: tokenTo,
            fromAmount: Number(Number($('.investFromAmount').val())),
            toAmount: Number(Number($('.investToAmount').val()))
        }

    }

    /**
     * Withdraw token
     * @param token
     * @param pairContract
     * @returns {Promise<void>}
     */

    /*async withdrawToken(token, pairContract) {

        let address = prompt(`Withdraw wallet address for ${token.symbol} token`);
        let amount = Number(prompt('Withdraw amount'));

        if(address !== '' && amount) {

            let waiter = await popups.waiting('Sending transaction...');

            try {
                let tx = await pairContract.withdrawTokens(token.rootAddress, address, utils.numberToUnsignedNumber(amount));
                console.log(tx);
                await popups.error(`Transaction created<br>TXID: ${utils.getTxId(tx)}`, '<i class="fas fa-wallet"></i>')
            } catch (e) {
                console.log(e);
                await popups.error('Error: ' + (e.message ? e.message : e.text));
            }

            waiter.hide();

        } else {
            await popups.error('Invalid address or amount');
        }
    }*/

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
             * @type {SwapPairContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            //Update pair info
            pairInfo = await pairContract.getPairInfo();


            //Init tokens root contracts
            const getterToken = await new TokenRootContract(this.ton, this.config).init(tokens.to.rootAddress);
            const senderToken = await new TokenRootContract(this.ton, this.config).init(tokens.from.rootAddress);


            //Detect from token wallet
            let toWalletTokenAddress = null;
            if(pairInfo.tokenRoot1 === tokens.from.rootAddress) {
                toWalletTokenAddress = pairInfo.tokenWallet1;
            } else {
                toWalletTokenAddress = pairInfo.tokenWallet2;
            }

            //Get swap payload
            const swapPayload = await pairContract.createSwapPayload(await getterToken.getWalletAddress());

            //Get sender token wallet
            const tokenSenderWallet = await new TokenWalletContract(this.ton, this.config).init(await senderToken.getWalletAddress());

            //Transfer with swap payload
            let swapResult = await tokenSenderWallet.transfer(toWalletTokenAddress, utils.numberToUnsignedNumber(tokens.fromAmount, tokens.from.decimals), swapPayload);
            console.log('SWAP RESULT', swapResult);

            await popups.error(`Success!<br>The swap is still in progress. After the completion of the swap, the tokens will appear on your wallet.`, '<i class="fas fa-retweet"></i>');

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
        $('.plusInLiquidity, .createPairButton').hide();
        $('.liquidityLoader').show();
        $('.investToAmount, .investFromAmount, .createPoolButton, .liquidityWithdrawButton ').addClass('disabled');

        let tokens = await this.getInvestTokens();
        console.log(tokens);
        if(tokens.from && tokens.to) {
            try {

                let pairInfo;
                try {
                    pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
                    console.log('INVEST PAIR INFO', pairInfo,tokens.from.rootAddress,  tokens.to.rootAddress)
                } catch (e) {
                    $('.currentPoolFrom,.currentPoolTo').text('Pair not found');
                    $('.plusInLiquidity').show();
                    $('.liquidityLoader').hide();
                    $('.createPairButton').fadeIn(500);
                    return;
                }


                $('.addLiquidityPair').text(`${tokens.from.symbol}/${tokens.to.symbol}`)
                $('.addLiquidityFromLogo').attr('src', tokens.from.icon);
                $('.addLiquidityToLogo').attr('src', tokens.to.icon);

                $('.addLiquidityFromSymbol').text(tokens.from.symbol);
                $('.addLiquidityToSymbol').text(tokens.to.symbol);

                /**
                 *
                 * @type {SwapPairContract}
                 */
                let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);
                console.log('PAIR', pairContract);

                await this._updateUserTonBalance(pairContract);

                //More pair info we can get from pair
                //pairInfo = await pairContract.getPairInfo();


                //TODO Add all decimals
                console.log('INITIATOR', initiator);
                //If initiator - from form
                if(initiator === 'from' || initiator === '') {
                    let otherToken = await pairContract.getAnotherTokenProvidingAmount(tokens.from.rootAddress, utils.numberToUnsignedNumber(tokens.fromAmount, tokens.from.decimals));
                    if(utils.unsignedNumberToSigned(otherToken.anotherTokenAmount, tokens.from.decimals) !== utils.unsignedNumberToSigned(0, tokens.from.decimals)) {
                        $('.investToAmount').val(utils.showToken(utils.unsignedNumberToSigned(otherToken.anotherTokenAmount, tokens.from.decimals)));
                    }
                }

                //If initiator to form
                if(initiator === 'to') {
                    let otherToken = await pairContract.getAnotherTokenProvidingAmount(tokens.to.rootAddress, utils.numberToUnsignedNumber(tokens.toAmount, tokens.to.decimals));
                    if(utils.unsignedNumberToSigned(otherToken.anotherTokenAmount, tokens.to.decimals) !== utils.unsignedNumberToSigned(0, tokens.to.decimals)) {
                        $('.investFromAmount').val(utils.showToken(utils.unsignedNumberToSigned(otherToken.anotherTokenAmount, tokens.to.decimals)));
                    }
                }


                //In pool balances

                const lpToken = await new TokenRootContract(this.ton, this.config).init(pairInfo.lpTokenRoot);

                try {
                    const lpTokenWallet = await new TokenWalletContract(this.ton, this.config).init(await lpToken.getWalletAddress());
                    const lpDetails = await lpToken.getDetails();
                    const poolPercentage = BigNumber(await lpTokenWallet.getBalance()).div(lpDetails.total_supply).times(100).toFixed();
                    console.log(lpToken);

                    let exchangeRateData = await pairContract.getCurrentExchangeRate();
                    let fromPool = exchangeRateData.lp1;
                    let toPool = exchangeRateData.lp2;
                    if(tokens.from.rootAddress !== pairInfo.tokenRoot1) {
                        fromPool = exchangeRateData.lp2;
                        toPool = exchangeRateData.lp1;
                    }


                    $('.currentPoolLp').text(
                        utils.unsignedNumberToSigned(await lpTokenWallet.getBalance(), Number(lpDetails.decimals))
                        + ' ' +
                        poolPercentage
                        + '%'
                    );

                    console.log('LP BALANCE', await lpTokenWallet.getBalance());

                    $('.currentPoolFrom').text(utils.unsignedNumberToSigned(BigNumber(fromPool).times(poolPercentage), tokens.from.decimals));
                    $('.currentPoolTo').text(utils.unsignedNumberToSigned(BigNumber(toPool).times(poolPercentage), tokens.to.decimals));
                }catch (e) {
                    console.log(e);
                    $('.currentPoolLp').text(0);
                    $('.currentPoolFrom').text(0);
                    $('.currentPoolTo').text(0);
                }

                $('.currentPoolFromSymbol').text(tokens.from.symbol);
                $('.currentPoolToSymbol').text(tokens.to.symbol);

                //$('.currentPoolFrom').text(utils.showToken(utils.unsignedNumberToSigned(userPairBalance[tokens.from.rootAddress], tokens.from.decimals)));
                //$('.currentPoolTo').text(utils.showToken(utils.unsignedNumberToSigned(userPairBalance[tokens.to.rootAddress], tokens.to.decimals)));

                /* try {
                    let userPairBalance = await pairContract.getUserLiquidityPoolBalance();
                    console.log('POOL BALANCES', userPairBalance);

                    $('.inPoolFromBalance').text(utils.showToken(utils.unsignedNumberToSigned(userPairBalance.balance[tokens.from.rootAddress], tokens.from.decimals)) + ' ' + tokens.from.symbol);
                    $('.inPoolToBalance').text(utils.showToken(utils.unsignedNumberToSigned(userPairBalance.balance[tokens.to.rootAddress], tokens.to.decimals)) + ' ' + tokens.to.symbol);
           } catch (e) {
                    $('.currentPoolFrom').text(0);
                    $('.currentPoolTo').text(0);
                    console.log('POOL BALANCE EXCEPTION', e);
                }*/


            } catch (e) {
                $('.pairAddress').text('Pair not found');
                console.log('EXCEPTION', e);
            }
        }


        $('.investToAmount, .investFromAmount, .createPoolButton, .liquidityWithdrawButton ').removeClass('disabled');
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

        try {
            let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
            /**
             *
             * @type {SwapPairContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            await this._updateUserTonBalance(pairContract);

            let firstTokenAmount = 0;
            let secondTokenAmount = 0;

            if(pairInfo.tokenRoot1 === tokens.from.rootAddress) {
                firstTokenAmount = utils.numberToUnsignedNumber(tokens.fromAmount, tokens.from.decimals);
                secondTokenAmount = utils.numberToUnsignedNumber(tokens.toAmount, tokens.to.decimals);
            } else {
                firstTokenAmount = utils.numberToUnsignedNumber(tokens.toAmount, tokens.to.decimals);
                secondTokenAmount = utils.numberToUnsignedNumber(tokens.fromAmount, tokens.from.decimals);
            }

            let finalAmounts = await pairContract.getProvidingLiquidityInfo(firstTokenAmount, secondTokenAmount)

            if(pairInfo.tokenRoot1 === tokens.from.rootAddress) {
                $('.addLiquidityFromAmountFinal').text(utils.unsignedNumberToSigned(finalAmounts.providedFirstTokenAmount, tokens.from.decimals));
                $('.addLiquidityToAmountFinal').text(utils.unsignedNumberToSigned(finalAmounts.providedSecondTokenAmount, tokens.from.decimals));
            } else {
                $('.addLiquidityFromAmountFinal').text(utils.unsignedNumberToSigned(finalAmounts.providedSecondTokenAmount, tokens.from.decimals));
                $('.addLiquidityToAmountFinal').text(utils.unsignedNumberToSigned(finalAmounts.providedFirstTokenAmount, tokens.from.decimals));
            }


        } catch (e) {
            waiter.hide();
            console.log('Add liquidity error', e);
            await popups.error('Add liquidity error: ' + e.message);
            return;
        }


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
    async addPool() {
        let tokens = await this.getInvestTokens();
        let waiter = await popups.waiting('Processing...');

        try {
            let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
            /**
             *
             * @type {SwapPairContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            //Update pair info
            pairInfo = await pairContract.getPairInfo();
            console.log('PAIR INFO', pairInfo)

            await this._updateUserTonBalance(pairContract);


            let provideLiquidityPayload = await pairContract.createProvideLiquidityPayload();

            //Init tokens root contracts
            const fromToken = await new TokenRootContract(this.ton, this.config).init(tokens.from.rootAddress);
            const toToken = await new TokenRootContract(this.ton, this.config).init(tokens.to.rootAddress);


            //Get sender and getter wallets token wallet
            const fromTokenWallet = await new TokenWalletContract(this.ton, this.config).init(await fromToken.getWalletAddress());
            const toTokenWallet = await new TokenWalletContract(this.ton, this.config).init(await toToken.getWalletAddress());


            if(await fromTokenWallet.getContractBalance() < 2e9){
                await popups.error(`First token wallet balance less than 2 TON. Top up the balance of the token wallet at least to 2 TON for the operation`);
                waiter.hide();
                return ;
            }

            if(await toTokenWallet.getContractBalance() < 2e9){
                await popups.error(`Second token wallet balance less than 2 TON. Top up the balance of the token wallet at least to 2 TON for the operation`);
                waiter.hide();
                return ;
            }



            //Detect from token wallet
            let toWalletTokenAddress = null;
            let fromWalletTokenAddress = null;
            if(pairInfo.tokenRoot1 === tokens.from.rootAddress) {
                fromWalletTokenAddress = pairInfo.tokenWallet1;
                toWalletTokenAddress = pairInfo.tokenWallet2;
            } else {
                fromWalletTokenAddress = pairInfo.tokenWallet2;
                toWalletTokenAddress = pairInfo.tokenWallet1;
            }

            console.log('PROVIDING INFO', tokens.fromAmount, tokens.toAmount)

            //Providing liquidity
            let providingResult1 = await fromTokenWallet.transfer(fromWalletTokenAddress, utils.numberToUnsignedNumber(tokens.fromAmount, tokens.from.decimals), provideLiquidityPayload);
            console.log('PROV1 RESULT', providingResult1);

            let providingResult2 = await toTokenWallet.transfer(toWalletTokenAddress, utils.numberToUnsignedNumber(tokens.toAmount, tokens.to.decimals), provideLiquidityPayload, 1e9);
            console.log('PROV2 RESULT', providingResult2);


            // let supplyResult = await pairContract.provideLiquidity(utils.numberToUnsignedNumber(firstTokenAmount, tokens.from.decimals), utils.numberToUnsignedNumber(secondTokenAmount, tokens.to.decimals));

            // console.log(supplyResult);
            console.log('PAIR', pairContract);

            await popups.error(`Success! Txid: ${utils.getTxId(providingResult2)}`, '<i class="fas fa-retweet"></i>');

        } catch (e) {
            console.log('Supply error', e);
            await popups.error(`Supply error: ${e.message}`);
        }

        await this.updateAddLiquidityView();

        waiter.hide();
    }

    async withdrawFromPool() {
        let tokens = await this.getInvestTokens();
        let firstTokenAmount = 0;
        let secondTokenAmount = 0;

        let waiter = await popups.waiting('Processing...');

        try {
            let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
            /**
             *
             * @type {SwapPairContract}
             */
            let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);

            await this._updateUserTonBalance(pairContract);
            /*if(pairInfo.tokenRoot1 === tokens.from.rootAddress) {
                firstTokenAmount = prompt(`${tokens.from.symbol} max amount`);
                secondTokenAmount = prompt(`${tokens.to.symbol} max amount`);
            } else {
                firstTokenAmount = prompt(`${tokens.to.symbol} max amount`);
                secondTokenAmount = prompt(`${tokens.from.symbol} max amount`);
            }*/

            // let percentage = prompt('Enter the amount of liquidity in percent for withdrawal');


            const getterToken = await new TokenRootContract(this.ton, this.config).init(tokens.to.rootAddress);
            const senderToken = await new TokenRootContract(this.ton, this.config).init(tokens.from.rootAddress);


            const lpToken = await new TokenRootContract(this.ton, this.config).init(pairInfo.lpTokenRoot);
            const lpTokenWallet = await new TokenWalletContract(this.ton, this.config).init(await lpToken.getWalletAddress());

            const withdrawPayload = await pairContract.createWithdrawLiquidityPayload(tokens.to.rootAddress, await getterToken.getWalletAddress(), tokens.from.rootAddress, await senderToken.getWalletAddress())

            /*
             let userPairBalance = await pairContract.getUserLiquidityPoolBalance();

             //200*(50/100)

             let result = await pairContract.withdrawLiquidity(userPairBalance.userLiquidityTokenBalance * (percentage / 100));
             console.log(result);*/

            //TODO check wallet balance
            let withdrawResult = await lpTokenWallet.transfer(pairInfo.lpTokenWallet, await lpTokenWallet.getBalance(), withdrawPayload, 1e9);

            console.log('WITHDRAW RESULT', withdrawResult);

            await popups.error(`Success! Txid: ${utils.getTxId(withdrawResult)}`, '<i class="fas fa-retweet"></i>');


        } catch (e) {
            console.log('Withdraw error', e);
            await popups.error(`'Withdraw error: ${e.message}`);
        }

        await this.updateAddLiquidityView();

        waiter.hide();
    }

    async sendTON() {
        if(confirm('Transfer TON to pay the LP fee?')) {
            let tokens = await this.getExchangeTokens();

            if(!tokens.from || tokens.to) {
                await popups.error(`Select tokens on exchange page`);
                return;
            }

            let waiter = await popups.waiting('Sending...');


            try {
                let pairInfo = await this.swapRoot.getPairInfo(tokens.from.rootAddress, tokens.to.rootAddress);
                /**
                 *
                 * @type {SwapPairContract}
                 */
                let pairContract = await new SwapPairContract(this.ton, this.config).init(pairInfo.swapPairAddress);
                let balances = await this._getUserTonBalanceAndFee(pairContract);
                let sendResult = await this.ton.sendTONWithPubkey(pairInfo.swapPairAddress, balances.fee + balances.fee, (await this.ton.getKeypair()).public);
                console.log('SEND RESULT', sendResult);

                waiter.hide();
            } catch (e) {
                console.log('Send TON exception', e);
                waiter.hide();
                await popups.error(`Send TON exception ${e.message}`);
            }
        }
    }

    /**
     * Create new pair
     * @returns {Promise<void>}
     */
    async createNewPair() {
        let tokens = await this.getInvestTokens();

        console.log(tokens.from.rootAddress, tokens.to.rootAddress);
        if(tokens.from.rootAddress === tokens.to.rootAddress) {
            await popups.error(`'Can't create pair with same tokens`);
            return;
        }

        let waiter = await popups.waiting('Creating...');
        try {
            let result = await this.swapRoot.deploySwapPair(tokens.from.rootAddress, tokens.to.rootAddress);
            console.log(result);
            await popups.error(`Success! Txid: ${utils.getTxId(result)}`, '<i class="fas fa-retweet"></i>');
        } catch (e) {
            console.log('Pair creating error', e);
            await popups.error(`'Pair creating error: ${e.message}`);
        }


        await this.updateAddLiquidityView();
        waiter.hide();
    }

    /**
     *
     * @param {SwapPairContract} pairContract
     * @returns {Promise<void>}
     * @private
     */
    async _updateUserTonBalance(pairContract) {
        let balances = await this._getUserTonBalanceAndFee(pairContract);
        console.log('TON BALANCE', balances);
        $('.txComission').text(utils.showToken(utils.unsignedNumberToSigned(balances.fee)) + ' TON')
        $('.tonBalance').text(utils.showToken(utils.unsignedNumberToSigned(balances.balance)) + ' TON');
        $('.accountLink').attr('href', 'https://' + (await this.ton.getNetwork()).explorer + '/accounts/accountDetails?id=' + (await this.ton.getWallet()).address);
    }

    /**
     * Get user TON balance and tx fee
     * @param {SwapPairContract}  pairContract
     * @returns {Promise<{balance: (*|number|*), fee: *}>}
     * @private
     */
    async _getUserTonBalanceAndFee(pairContract) {
        //let balance = (await pairContract.getUserTONBalance()).balance;
        return {balance: 0, fee: 0}
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


