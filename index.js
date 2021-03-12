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
 * Server side
 */
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.use(express.static('public'));

app.use('/modules/freeton', express.static('node_modules/freeton/src'));
app.use('/modules/ton-client-web-js', express.static('node_modules/ton-client-web-js/'));
app.use('/ton', express.static('dist'));
app.use('/tonclient.wasm', express.static('dist/tonclient.wasm'));


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('*', function (req, res) {
    res.status(404).sendFile(path.join(__dirname + '/public/404.html'));
});

app.listen(port, () => {
    console.log(`TONSwap interface http://localhost:${port}`);
});