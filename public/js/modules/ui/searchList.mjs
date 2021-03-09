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

const tokenList = {
    keyup: function () {

        let value = $(this).val().toLowerCase();

        $(this).parent().find("li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    },
    load: function (tokens = [], element = $('#currencyList')) {
        let html = `<ul class="select-token__list" id="currencyList">`;
        for (let token of tokens) {
            html += `<li class="select-token__list-item selectToken" data-address="${token.rootAddress}" style="">
                                <img src="${token.icon}" alt="">
                                <span>${token.symbol} - ${token.name}</span>
                     </li>`;
        }

        html += `</ul>`;
        $(element).html(html)
    }
}

//Initialize token lists
$('.tokenList').keyup(tokenList.keyup)

export default tokenList;