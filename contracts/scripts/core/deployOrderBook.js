const {
  deployContract,
  contractAt,
  sendTxn,
  writeTmpAddresses,
} = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");

const network = process.env.HARDHAT_NETWORK || "mainnet";
const tokens = require("./tokens")[network];

async function main() {
  const { nativeToken } = tokens;

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(
    orderBook.initialize(
      "0x9129C825ec9f7b033909497B3a1275921C8Accac", // router
      "0x22e207058B094278801bb686554b54D2A1266028", // vault
      nativeToken.address, // weth
      "0x8E67Ecd4B2C0d1C81ec008081ff082F42f427e75", // usdg
      "10000000000000000", // 0.01 MATIC
      expandDecimals(10, 30) // min purchase token amount usd
    ),
    "orderBook.initialize"
  );

  writeTmpAddresses({
    orderBook: orderBook.address,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
