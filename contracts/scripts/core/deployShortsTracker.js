const {
  getFrameSigner,
  deployContract,
  contractAt,
  sendTxn,
  readTmpAddresses,
  writeTmpAddresses,
} = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const { getArgumentForSignature } = require("typechain");

const network = process.env.HARDHAT_NETWORK || "mainnet";
const tokens = require("./tokens")[network];

async function getPolygonValues() {
  return { vaultAddress: "0x22e207058B094278801bb686554b54D2A1266028" };
}

async function getValues() {
  return await getPolygonValues();
}

async function main() {
  const { vaultAddress, gasLimit } = await getValues();
  const gov = { address: "0x98811E850D7E67b3f868370495364fD7B9522030" };
  const shortsTracker = await deployContract(
    "ShortsTracker",
    [vaultAddress],
    "ShortsTracker",
    { gasLimit }
  );
  await sendTxn(shortsTracker.setGov(gov.address), "shortsTracker.setGov");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
