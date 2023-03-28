const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const { errors } = require("../../test/core/Vault/helpers");

const tokenList = [
  {
    _token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    _tokenName: "ETH",
    _priceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x20865e63B111B2649ef829EC220536c82C58ad7B",
    _tokenName: "BNB",
    _priceFeed: "0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    _tokenName: "BTC",
    _priceFeed: "0x6ce185860a4963106506C203335A2910413708e9",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x078f358208685046a11C85e8ad32895DED33A249",
    _tokenName: "AAVE",
    _priceFeed: "0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    _tokenName: "LINK",
    _priceFeed: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    _tokenName: "UNI",
    _priceFeed: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    _tokenName: "CURVE",
    _priceFeed: "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    _tokenName: "GMX",
    _priceFeed: "0xDB98056FecFff59D032aB628337A4887110df3dB",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
    _tokenName: "BAL",
    _priceFeed: "0xBE5eA816870D11239c543F84b71439511D70B94f",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x2c852D3334188BE136bFC540EF2bB8C37b590BAD",
    _tokenName: "MAGIC",
    _priceFeed: "0x47E55cCec6582838E173f252D08Afd8116c2202d",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB",
    _tokenName: "KNC",
    _priceFeed: "0xbF539d4c2106dd4D9AB6D56aed3d9023529Db145",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    _tokenName: "DPX",
    _priceFeed: "0xc373B9DB0707fD451Bc56bA5E9b029ba26629DF0",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
    _tokenName: "DODO",
    _priceFeed: "0xA33a06c119EC08F92735F9ccA37e07Af08C4f281",
    _priceDecimals: 8,
    _isStrictStable: false,
  },
  {
    _token: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    _tokenName: "USDC",
    _priceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    _priceDecimals: 8,
    _isStrictStable: true,
  },
  {
    _token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    _tokenName: "USDT",
    _priceFeed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    _priceDecimals: 8,
    _isStrictStable: true,
  },
  {
    _token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    _tokenName: "DAI",
    _priceFeed: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
    _priceDecimals: 8,
    _isStrictStable: true,
  },
  {
    _token: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    _tokenName: "FRAX",
    _priceFeed: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
    _priceDecimals: 8,
    _isStrictStable: true,
  },
];

async function main() {
  const vaultPriceFeed = await contractAt(
    "VaultPriceFeed",
    "0x176C440866992007E932E2A3633E46F99D3c46B3"
  );

  for (let i = 0; i < tokenList.length; i++) {
    await sendTxn(
      vaultPriceFeed.setTokenConfig(
        tokenList[i]["_token"],
        tokenList[i]["_priceFeed"],
        tokenList[i]["_priceDecimals"],
        tokenList[i]["_isStrictStable"]
      ),
      "vaultPriceFeed.setTokenConfig " + tokenList[i]["_tokenName"]
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
