// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities");

module.exports = {
  // polygon: {
  //   nativeToken: {
  //     name: "matic",
  //     address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //     decimals: 18,
  //   },
  // },
  // bsc: {
  //   nativeToken: {
  //     name: "bnb",
  //     address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  //     decimals: 18,
  //   },
  // },
  // optimism: {
  //   nativeToken: {
  //     name: "eth",
  //     address: "0x4200000000000000000000000000000000000006",
  //     decimals: 18,
  //   },
  // },
  arbitrumOne: {
    nativeToken: {
      name: "eth",
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      decimals: 18,
    },
  },
};
