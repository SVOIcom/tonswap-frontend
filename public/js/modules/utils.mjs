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


const utils = {
    /**
     * Shorten pubkey or address
     * @param pubkey
     * @param delimiter
     * @returns {string}
     */
    shortenPubkey: (pubkey, delimiter = '...') => {
        pubkey = String(pubkey);
        return pubkey.substr(0, 6) + delimiter + pubkey.substr(-4);
    },
    /**
     * Convert string to hex string
     * @param {string} str
     * @returns {string}
     */
    toHex(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += str.charCodeAt(i).toString(16);
        }
        return result;
    },
    /**
     * Transfer hack ABI
     */
    TRANSFER_BODY: {
        "ABI version": 2,
        "functions": [
            {
                "name": "transfer",
                "id": "0x00000000",
                "inputs": [
                    {
                        "name": "comment",
                        "type": "bytes"
                    }
                ],
                "outputs": []
            }
        ],
        "events": [],
        "data": []
    },

    /**
     * Big hex string to big dec string
     * @param {string} s
     * @returns {string}
     */
    hexString2DecString(s) {

        function add(x, y) {
            let c = 0, r = [];
            x = x.split('').map(Number);
            y = y.split('').map(Number);
            while (x.length || y.length) {
                let s = (x.pop() || 0) + (y.pop() || 0) + c;
                r.unshift(s < 10 ? s : s - 10);
                c = s < 10 ? 0 : 1;
            }
            if(c) {
                r.unshift(c);
            }
            return r.join('');
        }

        let dec = '0';
        s.split('').forEach(function (chr) {
            let n = parseInt(chr, 16);
            for (let t = 8; t; t >>= 1) {
                dec = add(dec, dec);
                if(n & t) {
                    dec = add(dec, '1');
                }
            }
        });
        return dec;
    },
    /**
     * Show token
     * @param {number|string} amount
     * @param {number} precision
     * @returns {string}
     */
    showToken(amount, precision = 9) {
        amount = Number(amount);
        if(!amount) {
            return '0';
        }

        return String(amount.toFixed(precision));
    },

    numberToUnsignedNumber(num, decimals = 9) {
        return Number(Number(num).toFixed(decimals).replace('.', ''))
    },
    unsignedNumberToSigned(num, decimals = 9) {
        return Number(Number(Number(num) / Math.pow(10, decimals)).toFixed(9));
    },
    bigNumberToString(number) {
        return Number(number).toLocaleString('en').replace(/,/g, '');
    },
    getTxId(tx) {
        if(tx.txid) {
            return txid;
        }

        if(tx.transaction) {
            if(tx.transaction.id) {
                return tx.transaction.id
            }
        }

        if(tx.tx) {
            if(tx.tx.lastBlockId) {
                return tx.tx.lastBlockId
            }

        }


    }

}
export default utils;