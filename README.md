![photo_2020-12-15_20-21-41](https://user-images.githubusercontent.com/18599919/111032509-ac9fbd80-841d-11eb-9639-843ef2d758b3.jpg)
# TONSwap Frontend

You can see deployed version at [http://swap.tonswap.com](http://swap.tonswap.com)

User interface for the TONSwap liquidity pair system.

The interface supports connection to the FreeTON network using the extraTON extension, as well as using a key pair or seed phrase directly through the ton-client-web-js


## Defaults

For now frontend use provided devnet by default network: https://devnet.tonswap.com

If the extraTON extension is enabled, you can only connect to the networks provided by the extension.

The default server can be changed in the **public/js/config.js** file

## Bulding

Initially, no additional assembly of the project is required, however, you can update the versions of the ton-client library by command
```shell
npm install
npx webpack
```

## Links
[![Channel on Telegram](https://img.shields.io/badge/-TON%20Swap%20TG%20chat-blue)](https://t.me/tonswap)

## Authors

Developed by [SVOI.dev](https://SVOI.dev) team

* [Andrey Nedobylsky](https://github.com/lailune)
* [Paul Mikhaylov](https://github.com/Pafaul)
* [Антон Щербаков](https://github.com/4erpakOFF)
* [Daniil Taldykin](https://github.com/DaTaLe)

