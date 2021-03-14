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

export default {
    /**
     * Makes error popup
     * @param {string} errorText
     * @param {string} errorIcon Error icon html. By default error.svg. Supports Font Awesome <i className="fas fa-exclamation-triangle"></i>
     * @returns {string}
     */
    error: (errorText, errorIcon = '<img src="../img/error/error.svg" alt="Error icon" />') => {
        return `<div class="popup popup-error">
        <div class="popup__content">
            <div class="error">
                <div class="error__icon">${errorIcon}</div>
                <p class="waiting__title">${errorText}</p>
                <button class="button button_blue button_n error__dismiss " data-fancybox-close>OK</button>
            </div>
        </div>
    </div>`;
    },

    /**
     * Transaction submitted popup
     * @param {string} title
     * @param {{text: {string},href: {string}}|undefined} url
     * @param errorIcon
     * @returns {string}
     */
    transactionSubmitted: (title, url = {
        text: undefined,
        href: '#'
    }, errorIcon = '<img src="../img/success/success.svg" alt="Success icon" />') => {
        return `<div class="popup popup-success">
        <div class="popup__content">
            <div class="success">
                <div class="success__icon">${errorIcon}</div>
                <p class="waiting__title">${title}</p>
                <p class="success__view">${url.text ? `<a target="_blank" href="${url.href}">${url.text}</a>` : ''}</p>
                <button class="button button_blue button_n success__close" data-fancybox-close>Close</button>
            </div>
        </div>
    </div>`;
    },

    /**
     * Waiting dialog with spinner
     * @param title
     * @param subtext
     * @param subtext2
     * @returns {string}
     */
    waiting(title, subtext = '', subtext2 = '') {
        return `    <div class="popup popup-waiting">
        <div class="popup__content">
            <div class="waiting">
                <div class="waiting__icon"></div>
                <p class="waiting__title">${title}</p>
                <p class="waiting__sub-title">${subtext}</p>
                <p class="waiting__description">${subtext2} </p>
        </div>
        </div>
    </div>`;
    },

    getKeys() {
        return `<div class="popup popup-select-token">
        <div class="popup__content">
            <div class="select-token">
                <div class="select-token__body">
                    <p class="select-token__title">Public key</p>
                    <input class="form__input select-token__input" id="publicKeyInput" type="text" placeholder="Enter FreeTON public key">
                </div>        
                        <div class="select-token__body">
                    <p class="select-token__title">Wallet address</p>
                    <input class="form__input select-token__input" id="walletAddressInput" type="text" placeholder="Enter multisig wallet address">
                </div>
                <div class="select-token__body">
                    <p class="select-token__title">Seed phrase or private key (12 or 24 words)</p>
                    <input class="form__input select-token__input" id="seedPhraseInput" type="text" placeholder="Enter FreeTON seed phrase">
                </div>
                <div class="select-token__footer">
                    <button class="button button_l-blue button_m select-token__manage " id="applyKeysButton" >Apply</button>
                </div>
            </div>
        </div>
    </div>`;
    }
};