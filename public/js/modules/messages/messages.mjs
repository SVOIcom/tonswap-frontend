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

let messageIds = 0;
let buttonId = 0;
let buttonsActions = {};

/**
 * Message themes
 * @type {{white: string, blue: string, none: string}}
 */
const THEMES = {
    none: '',
    white: 'messages-item_theme_white',
    blue: 'messages-item_theme_blue'
};

/**
 * Messages types
 * @type {{simple: string}}
 */
const TYPES = {
    simple: '_simpleMessage',
};

/**
 * Messages manager
 * @type {{button: (function(*=, *=): {action: action, id: number, text: string}), TYPES: {simple: string}, THEMES: {white: string, blue: string, none: string}, _constructButtons: (function(*=, *): (string|string)), _simpleMessage: (function(*=): string), show: (function(*=): {waitForClose: Promise<unknown>, id: number, message: *|jQuery|HTMLElement, close: function(): void})}}
 */
const messages = {

    /**
     * Make button
     * @param {string} text
     * @param {function} action
     * @returns {{action: *, id: number, text: *}}
     */
    button: function (text = '', action = () => {
    }) {
        let id = buttonId++;
        return {id, text, action}
    },

    /**
     * Construct buttons html and markup actions
     * @param {array} buttons
     * @param {number} msgId
     * @returns {string}
     * @private
     */
    _constructButtons: (buttons = [], msgId) => {
        if(buttons && buttons.length === 0) {
            return '';
        }


        let buttonsHtml = `<div class="messages-item__buttons">`;

        for (let button of buttons) {

            buttonsHtml += ` <div class="button button_l-blue messages-item__button messageButton" data-msgid="${msgId}" data-buttonid="${button.id}"  id="${msgId}_${button.id}_button">${button.text}</div>`;
            if(!buttonsActions[msgId]) {
                buttonsActions[msgId] = {};
            }

            buttonsActions[msgId][button.id] = button.action;
            //$(`#${msgId}_${button.id}_button`).click(button.action);
        }

        buttonsHtml += `</div>`;

        return buttonsHtml;
    },

    /**
     * Generate simple message html
     * @param {object} options
     * @returns {string}
     * @private
     */
    _simpleMessage: function (options = {theme: THEMES.none, title: '', text: '', msgId: 0}) {
        return `<div class="messages-item ${options.theme}" style="display: none">
            <div class="messages-item__close" id="msgclose_${options.msgId}"></div>
            <p class="messages-item__b-title">${options.title}</p>
            <div class="messages-item__text">
                <p>${options.text}</p>
            </div>
            ${this._constructButtons(options.buttons, options.msgId)}
        </div>`;
    },

    /**
     * Show message popup
     * @param {object} options
     * @returns {{waitForClose: Promise<*>, id: number, message: (*|jQuery|HTMLElement), close: close}}
     */
    show: function (options = {
        theme: THEMES.none,
        title: '',
        text: '',
        type: TYPES.simple,
        timeout: 30000
    }) {
        let msgId = messageIds++;
        let message = this[options.type]({msgId, ...options});
        $('#messagesHolder').prepend(message);

        let messageEl = $(`#msgclose_${msgId}`);

        //Markup buttons
        messageEl.closest(".messages-item").find('.messageButton').click(function () {
            let button = $(this);
            console.log(button);
            buttonsActions[Number(button.data('msgid'))][Number(button.data('buttonid'))].apply(this);
        })

        /**
         * Close message method
         */
        function close() {
            $(this).closest(".messages-item").slideUp().fadeOut({
                queue: false,
                complete: () => {
                    $(this).closest(".messages-item").remove();
                    buttonsActions[msgId] = undefined;
                    delete buttonsActions[msgId];
                }
            })
        }

        let closePromise = new Promise((resolve => {

            //Show message
            messageEl.closest(".messages-item").slideUp().fadeIn({queue: false});

            /**
             * On close handler
             */
            function closeHandler() {
                resolve();
                close.apply(messageEl);
            }


            //Close by timeout
            if(options.timeout > 0) {
                setTimeout(() => {
                    closeHandler();
                }, options.timeout)
            }

            //Add close click handler
            messageEl.click(closeHandler);

        }))

        return {
            message: messageEl,
            close: () => {
                close.apply(messageEl)
            },
            id: msgId,
            waitForClose: closePromise
        };
    },
    THEMES,
    TYPES
}
export {messages as default};