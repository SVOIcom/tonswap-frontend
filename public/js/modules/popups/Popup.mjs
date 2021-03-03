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

class Popup {
    /**
     * Popup
     * @param {string|object} popup
     * @param {object} options
     */
    constructor(popup, options = {}) {
        this.popup = popup;
        this.options = options;
        this.pop = null;
    }

    /**
     * Show popup
     * @param {object} options
     * @returns {Promise<boolean>}
     */
    show(options = {}) {
        return new Promise((resolve => {

            this.pop = $.fancybox.open( {
                src: this.popup,
                touch: false,
                //parentEl: $('.main'),
                type: 'inline',
                helpers: {
                    thumbs: {
                        width: 50,
                        height: 50,
                    },
                    overlay: {
                        locked: true,
                    },
                },
                beforeShow: function () {
                },
                afterShow: function () {
                    resolve(true);
                },
                ...this.options, ...options
            });
        }))
    }

    /**
     * Hide popup
     */
    hide() {
        $.fancybox.close(this.pop);
    }

    /**
     * Hide alias
     */
    close() {
        this.hide();
    }
}

export default Popup;