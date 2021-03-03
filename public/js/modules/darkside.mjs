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


/**
 * Dark theme controller
 * @type {{makeLight: darkside.makeLight, isDark: (function(): *|jQuery), makeDark: darkside.makeDark, toggle: darkside.toggle}}
 */
const darkside = {
    toggle: function () {
        if(this.isDark()) {
            this.makeLight();
        } else {
            this.makeDark();
        }
    },

    makeDark: function () {
        $('body').addClass('dark_theme');
        $("#light-mode").prop("checked", true);
        $("#light-mode-2").prop("checked", true);
    },

    makeLight: function () {
        $('body').removeClass('dark_theme');
        $("#light-mode").prop("checked", false);
        $("#light-mode-2").prop("checked", false);
    },

    isDark: function () {
        return $('body').hasClass('dark_theme');
    }
}
export default darkside;