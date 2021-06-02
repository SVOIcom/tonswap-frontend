/*_______ ____  _   _  _____
 |__   __/ __ \| \ | |/ ____|
    | | | |  | |  \| | (_____      ____ _ _ __
    | | | |  | | . ` |\___ \ \ /\ / / _` | '_ \
    | | | |__| | |\  |____) \ V  V / (_| | |_) |
    |_|  \____/|_| \_|_____/ \_/\_/ \__,_| .__/
                                         | |
                                         |_| */
import utils from "../../utils.mjs";

/**
 * @name TONSwap project - tonswap.com
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */


class SwapPairContract {
    /**
     *
     * @param {TonWallet} ton
     * @param {object} config
     */
    constructor(ton, config) {
        this.ton = ton;
        this.config = config;
        this.contract = null;
    }

    /**
     * Init contract
     * @returns {Promise<SwapPairContract>}
     */
    async init(address) {
        this.contract = await this.ton.loadContract('/contracts/abi/SwapPairContract.abi.json', address);
        return this;
    }

    /**
     * Get pair info
     * @returns {Promise<*>}
     */
    async getPairInfo() {
        return (await this.contract.getPairInfo({_answer_id: 0})).info;
    }


    /**
     * Return user balances
     * @returns {Promise<{}>}
     */
    async getUserBalance() {
        let pubkey = '0x' + (await this.ton.getKeypair()).public;
        let balance = await this.contract.getUserBalance({pubkey})

        let balances = {};
        balances[balance.ubi.tokenRoot1] = Number(balance.ubi.tokenBalance1);
        balances[balance.ubi.tokenRoot2] = Number(balance.ubi.tokenBalance2);
        balances.raw = balance.ubi;
        return balances;
    }


    /**
     * Get exchange rate
     * @param fromTokenRootAddress
     * @param amount
     * @returns {Promise<*>}
     */
    async getExchangeRate(fromTokenRootAddress, amount) {
        let result = await this.contract.getExchangeRate({
            swappableTokenRoot: fromTokenRootAddress,
            swappableTokenAmount: amount,
            _answer_id: 0
        })
        return result.value0;
    }

    async getCurrentExchangeRate() {
        let result = await this.contract.getCurrentExchangeRate({
            _answer_id: 0
        })
        return result.lpi;
    }

    /**
     * Withdraw tokens from pair
     *
     * @deploy
     *
     * @param tokenRoot
     * @param dest
     * @param amount
     * @returns {Promise<*>}
     */
    async withdrawTokens(tokenRoot, dest, amount) {
        return await this.contract.withdrawTokens.deploy({
            withdrawalTokenRoot: tokenRoot,
            receiveTokenWallet: dest,
            amount
        });
    }

    /**
     *
     * SWAP, BABY, SWAP!
     *
     * @deploy
     *
     * @param tokenRoot
     * @param amount
     * @returns {Promise<*>}
     */
    async swap(tokenRoot, amount) {
        return await this.contract.swap.deploy({
            swappableTokenRoot: tokenRoot,
            swappableTokenAmount: amount,
        });
    }

    /**
     * Get user liquidity pool balance
     * @returns {Promise<{}>}
     */
    async getUserLiquidityPoolBalance() {
        let pubkey = '0x' + (await this.ton.getKeypair()).public;
        let balance = (await this.contract.getUserLiquidityPoolBalance({pubkey}));

        console.log(balance);

        let balances = {};
        balances[balance.upi.tokenRoot1] = Number(balance.upi.lpToken1);
        balances[balance.upi.tokenRoot2] = Number(balance.upi.lpToken2);
        balances.liquidityTokensMinted = Number(balance.upi.liquidityTokensMinted);
        balances.userLiquidityTokenBalance = Number(balance.upi.userLiquidityTokenBalance);

        balances.balance = {};
        balances.balance[balance.upi.tokenRoot1] = (balances[balance.upi.tokenRoot1] * balances.userLiquidityTokenBalance) / balances.liquidityTokensMinted;
        balances.balance[balance.upi.tokenRoot2] = (balances[balance.upi.tokenRoot2] * balances.userLiquidityTokenBalance) / balances.liquidityTokensMinted;

        if(!balances.balance[balance.upi.tokenRoot1]) {
            balances.balance[balance.upi.tokenRoot1] = 0;
        }
        if(!balances.balance[balance.upi.tokenRoot2]) {
            balances.balance[balance.upi.tokenRoot2] = 0;
        }

        balances.raw = balance.upi;

        return balances;
    }

    /**
     * Get user TON balance
     * @returns {Promise<*>}
     */
    async getUserTONBalance() {
        let pubkey = '0x' + (await this.ton.getKeypair()).public;
        return (await this.contract.getUserTONBalance({pubkey}));
    }

    /**
     * Get comission
     * @returns {Promise<*>}
     */
    async getLPComission() {
        return (await this.contract.getLPComission()).value0;
    }

    /**
     * Add liquidity to pool
     * @param firstTokenAmount
     * @param secondTokenAmount
     * @returns {Promise<*>}
     */
    async provideLiquidity(firstTokenAmount, secondTokenAmount) {
        return await this.contract.provideLiquidity.deploy({
            maxFirstTokenAmount: firstTokenAmount,
            maxSecondTokenAmount: secondTokenAmount
        });
    }

    /**
     * Calculate final liquidity providing
     * @param firstTokenAmount
     * @param secondTokenAmount
     * @returns {Promise<*>}
     */
    async getProvidingLiquidityInfo(firstTokenAmount, secondTokenAmount) {
        return await this.contract.getProvidingLiquidityInfo({
            maxFirstTokenAmount: firstTokenAmount,
            maxSecondTokenAmount: secondTokenAmount
        });
    }

    /**
     * Withdraw liquidity from pool
     * @param liquidityTokensAmount
     * @returns {Promise<*>}
     */
    async withdrawLiquidity(liquidityTokensAmount) {
        return await this.contract.withdrawLiquidity.deploy({
            liquidityTokensAmount: utils.bigNumberToString(liquidityTokensAmount)
        });
    }

    /**
     * Get providing liquidity token rate
     * @param providingTokenRoot
     * @param providingTokenAmount
     * @returns {Promise<*>}
     */
    async getAnotherTokenProvidingAmount(providingTokenRoot, providingTokenAmount) {
        return await this.contract.getAnotherTokenProvidingAmount({
            providingTokenRoot,
            providingTokenAmount
        });
    }

    /**
     * Creates swap payload
     * @param sendTokensTo
     * @returns {Promise<*>}
     */
    async createSwapPayload(sendTokensTo) {
        return (await this.contract.createSwapPayload({
            sendTokensTo,
        })).value0;
    }

    async createWithdrawLiquidityPayload(tokenRoot1, tokenWallet1, tokenRoot2, tokenWallet2) {
        return (await this.contract.createWithdrawLiquidityPayload({
            tokenRoot1, tokenWallet1, tokenRoot2, tokenWallet2,
        })).value0;
    }

    async createProvideLiquidityPayload() {
        return (await this.contract.createProvideLiquidityPayload({
            tip3Address: '0:0000000000000000000000000000000000000000000000000000000000000000'
        })).value0;
    }

}


export default SwapPairContract;