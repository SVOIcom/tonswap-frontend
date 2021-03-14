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


## Authors

Developed by [SVOI.dev](https://SVOI.dev) team

* [Andrey Nedobylsky](https://github.com/lailune)
* [Paul Mikhaylov](https://github.com/Pafaul)
* [Антон Щербаков](https://github.com/4erpakOFF)
* [Daniil Taldykin](https://github.com/DaTaLe)

