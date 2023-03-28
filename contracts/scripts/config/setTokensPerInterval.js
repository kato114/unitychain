const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const { errors } = require("../../test/core/Vault/helpers");

async function main() {
  const stakedUnityChainRewardDistributor = await contractAt(
    "RewardDistributor",
    "0xf45108532dC4A37a97627376E7FE6b3dA563C2ad"
  );
  const stakedBonusFeeUnityChainRewardDistributor = await contractAt(
    "RewardDistributor",
    "0xc1011f844Ad5B8dEeA81bd1E1f507F81a068Ef0C"
  );
  const feeULPRewardDistributor = await contractAt(
    "RewardDistributor",
    "0x6F2736e4aBEc698F1a94Bf7777EDD11d10086587"
  );
  const feeStakedULPRewardDistributor = await contractAt(
    "RewardDistributor",
    "0xC00a95ab72a74FD8A1B6879edDEf368603ed4506"
  );

  // await sendTxn(
  //   stakedUnityChainRewardDistributor.setTokensPerInterval("10000000000000000"),
  //   "stakedUnityChainRewardDistributor.setTokensPerInterval"
  // );

  await sendTxn(
    stakedBonusFeeUnityChainRewardDistributor.setTokensPerInterval(
      "10000000000000000"
    ),
    "stakedBonusFeeUnityChainRewardDistributor.setTokensPerInterval"
  );

  await sendTxn(
    feeULPRewardDistributor.setTokensPerInterval("10000000000000000"),
    "feeULPRewardDistributor.setTokensPerInterval"
  );

  await sendTxn(
    feeStakedULPRewardDistributor.setTokensPerInterval("10000000000000000"),
    "feeStakedULPRewardDistributor.setTokensPerInterval"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
