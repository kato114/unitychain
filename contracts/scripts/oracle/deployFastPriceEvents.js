const {
  deployContract,
  contractAt,
  writeTmpAddresses,
  sendTxn,
} = require("../shared/helpers");

const network = process.env.HARDHAT_NETWORK || "mainnet";

const priceFeedList = [
  "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  "0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A",
  "0x6ce185860a4963106506C203335A2910413708e9",
  "0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034",
  "0x86E53CF1B870786351Da77A57575e79CB55812CB",
  "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
  "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
  "0xDB98056FecFff59D032aB628337A4887110df3dB",
  "0xBE5eA816870D11239c543F84b71439511D70B94f",
  "0x47E55cCec6582838E173f252D08Afd8116c2202d",
  "0xbF539d4c2106dd4D9AB6D56aed3d9023529Db145",
  "0xc373B9DB0707fD451Bc56bA5E9b029ba26629DF0",
  "0xA33a06c119EC08F92735F9ccA37e07Af08C4f281",
  "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
  "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
  "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
  "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
];

async function main() {
  const feedEvent = await deployContract(
    "FastPriceEvents",
    [],
    "FastPriceEvents"
  );
  // const feedEvent = await contractAt(
  //   "FastPriceEvents",
  //   "0x18Dc3Eab019517A6b8cB625FbFaf806eBAf96Df1"
  // );

  for (let i = 0; i < priceFeedList.length; i++) {
    console.log(priceFeedList[i]);
    await sendTxn(
      feedEvent.setIsPriceFeed(priceFeedList[i], true),
      "feedEvent.setIsPriceFeed"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
