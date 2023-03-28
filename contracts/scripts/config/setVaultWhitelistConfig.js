const { deployContract, contractAt, sendTxn } = require("../shared/helpers");

const tokenList = [
  {
    _tokenName: "ETH",
    _token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "BNB",
    _token: "0x20865e63B111B2649ef829EC220536c82C58ad7B",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "BTC",
    _token: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    _tokenDecimals: 8,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "AAVE",
    _token: "0x078f358208685046a11C85e8ad32895DED33A249",
    _tokenDecimals: 8,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "LINK",
    _token: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "UNI",
    _token: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "CURVE",
    _token: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "GMX",
    _token: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "BAL",
    _token: "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "MAGIC",
    _token: "0x2c852D3334188BE136bFC540EF2bB8C37b590BAD",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "KNC",
    _token: "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "DPX",
    _token: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "DODO",
    _token: "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: false,
    _isShortable: true,
  },
  {
    _tokenName: "USDC",
    _token: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    _tokenDecimals: 6,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: true,
    _isShortable: false,
  },
  {
    _tokenName: "USDT",
    _token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    _tokenDecimals: 6,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: true,
    _isShortable: false,
  },
  {
    _tokenName: "DAI",
    _token: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: true,
    _isShortable: false,
  },
  {
    _tokenName: "FRAX",
    _token: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    _tokenDecimals: 18,
    _tokenWeight: 2500,
    _minProfitBps: 150,
    _maxUsdgAmount: "30000000000000000000000000000000",
    _isStable: true,
    _isShortable: false,
  },
];

async function main() {
  const vault = await contractAt(
    "Vault",
    "0x22e207058B094278801bb686554b54D2A1266028"
  );

  for (let i = 0; i < tokenList.length; i++) {
    console.log(tokenList[i]["_tokenName"]);

    await sendTxn(
      vault.setTokenConfig(
        tokenList[i]["_token"],
        tokenList[i]["_tokenDecimals"],
        tokenList[i]["_tokenWeight"],
        tokenList[i]["_minProfitBps"],
        tokenList[i]["_maxUsdgAmount"],
        tokenList[i]["_isStable"],
        tokenList[i]["_isShortable"]
      ),
      "vault.setTokenConfig " + tokenList[i]["_tokenName"]
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
