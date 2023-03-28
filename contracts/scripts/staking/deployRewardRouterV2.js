const {
  deployContract,
  contractAt,
  sendTxn,
  writeTmpAddresses,
} = require("../shared/helpers");

const network = process.env.HARDHAT_NETWORK || "mainnet";
const tokens = require("../core/tokens")[network];

async function main() {
  const { nativeToken } = tokens;

  const vestingDuration = 365 * 24 * 60 * 60;

  const ulpManager = await contractAt(
    "UlpManager",
    "0x2F8Ce29026af7561891d7D92625DC5E450871598"
  );
  const ulp = await contractAt(
    "ULP",
    "0xc826631aBF70fa6ED0bb12076e033E770FCc9093"
  );

  const unity = await contractAt(
    "UnityChain",
    "0x9C36A6726aC539066EA6572587bc658D62E59F2d"
  );
  const esUnity = await contractAt(
    "EsUNITY",
    "0x18F07fE5Eb220FB06717D4005CB76f1C203Df023"
  );
  const bnUnity = await deployContract("MintableBaseToken", [
    "Bonus UnityChain",
    "bnUNITY",
    0,
  ]);
  // const bnUnity = await contractAt(
  //   "MintableBaseToken",
  //   "0xf8B164D7728dc3bD25238fe2520B303ECCc024cF"
  // );

  await sendTxn(
    esUnity.setInPrivateTransferMode(true),
    "esUnity.setInPrivateTransferMode"
  );
  await sendTxn(
    ulp.setInPrivateTransferMode(true),
    "ulp.setInPrivateTransferMode"
  );

  const stakedUnityTracker = await deployContract("RewardTracker", [
    "Staked UnityChain",
    "sUNITY",
  ]);
  // const stakedUnityTracker = await contractAt(
  //   "RewardTracker",
  //   "0x4cd64Bb0b44643632889CA6965A548022A347e2e"
  // );
  const stakedUnityDistributor = await deployContract("RewardDistributor", [
    esUnity.address,
    stakedUnityTracker.address,
  ]);
  // const stakedUnityDistributor = await contractAt(
  //   "RewardDistributor",
  //   "0x20EB294af87c3A94994941b49Ac1479dEb3F7a78"
  // );

  await sendTxn(
    stakedUnityTracker.initialize(
      [unity.address, esUnity.address],
      stakedUnityDistributor.address
    ),
    "stakedUnityTracker.initialize"
  );
  await sendTxn(
    stakedUnityDistributor.updateLastDistributionTime(),
    "stakedUnityDistributor.updateLastDistributionTime"
  );

  const bonusUnityTracker = await deployContract("RewardTracker", [
    "Staked + Bonus UnityChain",
    "sbUNITY",
  ]);
  // const bonusUnityTracker = await contractAt(
  //   "RewardTracker",
  //   "0x48eaBdec69B2d89848278CCC05d081aAe37607b8"
  // );

  const bonusUnityDistributor = await deployContract("BonusDistributor", [
    bnUnity.address,
    bonusUnityTracker.address,
  ]);
  // const bonusUnityDistributor = await contractAt(
  //   "BonusDistributor",
  //   "0x5dd23F32659FAb3CA011126435DbA8463392bb2f"
  // );

  await sendTxn(
    bonusUnityTracker.initialize(
      [stakedUnityTracker.address],
      bonusUnityDistributor.address
    ),
    "bonusUnityTracker.initialize"
  );
  await sendTxn(
    bonusUnityDistributor.updateLastDistributionTime(),
    "bonusUnityDistributor.updateLastDistributionTime"
  );

  const feeUnityTracker = await deployContract("RewardTracker", [
    "Staked + Bonus + Fee UnityChain",
    "sbfUNITY",
  ]);
  // const feeUnityTracker = await contractAt(
  //   "RewardTracker",
  //   "0x2E19beE4E0ebc1e6D6aF29d6d875409B549c86AC"
  // );

  const feeUnityDistributor = await deployContract("RewardDistributor", [
    nativeToken.address,
    feeUnityTracker.address,
  ]);
  // const feeUnityDistributor = await contractAt(
  //   "RewardDistributor",
  //   "0xdD9b8CCC89Bbff8540Ffc9Df15e506FbB36dC75C"
  // );

  await sendTxn(
    feeUnityTracker.initialize(
      [bonusUnityTracker.address, bnUnity.address],
      feeUnityDistributor.address
    ),
    "feeUnityTracker.initialize"
  );
  await sendTxn(
    feeUnityDistributor.updateLastDistributionTime(),
    "feeUnityDistributor.updateLastDistributionTime"
  );

  const feeUlpTracker = await deployContract("RewardTracker", [
    "Fee ULP",
    "fULP",
  ]);
  // const feeUlpTracker = await contractAt(
  //   "RewardTracker",
  //   "0xab15d85582a4BDBc28494D1baB8251D6Cd1F9081"
  // );

  const feeUlpDistributor = await deployContract("RewardDistributor", [
    nativeToken.address,
    feeUlpTracker.address,
  ]);

  await sendTxn(
    feeUlpTracker.initialize([ulp.address], feeUlpDistributor.address),
    "feeUlpTracker.initialize"
  );
  await sendTxn(
    feeUlpDistributor.updateLastDistributionTime(),
    "feeUlpDistributor.updateLastDistributionTime"
  );

  const stakedUlpTracker = await deployContract("RewardTracker", [
    "Fee + Staked ULP",
    "fsULP",
  ]);

  // const stakedUlpTracker = await contractAt(
  //   "RewardTracker",
  //   "0x2912c72567fbBa62431ADc9B88C17842AADa1D0e"
  // );

  const stakedUlpDistributor = await deployContract("RewardDistributor", [
    esUnity.address,
    stakedUlpTracker.address,
  ]);

  // const stakedUlpDistributor = await contractAt(
  //   "RewardDistributor",
  //   "0x6cBb2f142bccb904604cC320a7465F9932009639"
  // );

  await sendTxn(
    stakedUlpTracker.initialize(
      [feeUlpTracker.address],
      stakedUlpDistributor.address
    ),
    "stakedUlpTracker.initialize"
  );
  await sendTxn(
    stakedUlpDistributor.updateLastDistributionTime(),
    "stakedUlpDistributor.updateLastDistributionTime"
  );

  await sendTxn(
    stakedUnityTracker.setInPrivateTransferMode(true),
    "stakedUnityTracker.setInPrivateTransferMode"
  );
  await sendTxn(
    stakedUnityTracker.setInPrivateStakingMode(true),
    "stakedUnityTracker.setInPrivateStakingMode"
  );
  await sendTxn(
    bonusUnityTracker.setInPrivateTransferMode(true),
    "bonusUnityTracker.setInPrivateTransferMode"
  );
  await sendTxn(
    bonusUnityTracker.setInPrivateStakingMode(true),
    "bonusUnityTracker.setInPrivateStakingMode"
  );
  await sendTxn(
    bonusUnityTracker.setInPrivateClaimingMode(true),
    "bonusUnityTracker.setInPrivateClaimingMode"
  );
  await sendTxn(
    feeUnityTracker.setInPrivateTransferMode(true),
    "feeUnityTracker.setInPrivateTransferMode"
  );
  await sendTxn(
    feeUnityTracker.setInPrivateStakingMode(true),
    "feeUnityTracker.setInPrivateStakingMode"
  );

  await sendTxn(
    feeUlpTracker.setInPrivateTransferMode(true),
    "feeUlpTracker.setInPrivateTransferMode"
  );
  await sendTxn(
    feeUlpTracker.setInPrivateStakingMode(true),
    "feeUlpTracker.setInPrivateStakingMode"
  );
  await sendTxn(
    stakedUlpTracker.setInPrivateTransferMode(true),
    "stakedUlpTracker.setInPrivateTransferMode"
  );
  await sendTxn(
    stakedUlpTracker.setInPrivateStakingMode(true),
    "stakedUlpTracker.setInPrivateStakingMode"
  );

  const unityVester = await deployContract("Vester", [
    "Vested UnityChain", // _name
    "vUnity", // _symbol
    vestingDuration, // _vestingDuration
    esUnity.address, // _esToken
    feeUnityTracker.address, // _pairToken
    unity.address, // _claimableToken
    stakedUnityTracker.address, // _rewardTracker
  ]);

  // const unityVester = await contractAt(
  //   "Vester",
  //   "0x37b2CD251b55484d5611d7dAcEcf1f2eAaB68a80"
  // );

  const ulpVester = await deployContract("Vester", [
    "Vested ULP", // _name
    "vULP", // _symbol
    vestingDuration, // _vestingDuration
    esUnity.address, // _esToken
    stakedUlpTracker.address, // _pairToken
    unity.address, // _claimableToken
    stakedUlpTracker.address, // _rewardTracker
  ]);

  // const ulpVester = await contractAt(
  //   "Vester",
  //   "0x95a78D16ebf6563B8496913D016531837F74E1AE"
  // );
  const rewardRouter = await deployContract("RewardRouterV2", []);
  // const rewardRouter = await contractAt(
  //   "RewardRouterV2",
  //   "0xf2b3e51B903544727d1B632391b24918A6Bc79eB"
  // );
  await sendTxn(
    rewardRouter.initialize(
      nativeToken.address,
      unity.address,
      esUnity.address,
      bnUnity.address,
      ulp.address,
      stakedUnityTracker.address,
      bonusUnityTracker.address,
      feeUnityTracker.address,
      feeUlpTracker.address,
      stakedUlpTracker.address,
      ulpManager.address,
      unityVester.address,
      ulpVester.address
    ),
    "rewardRouter.initialize"
  );

  await sendTxn(
    ulpManager.setHandler(rewardRouter.address, true),
    "ulpManager.setHandler(rewardRouter)"
  );

  // allow rewardRouter to stake in stakedUnityTracker
  await sendTxn(
    stakedUnityTracker.setHandler(rewardRouter.address, true),
    "stakedUnityTracker.setHandler(rewardRouter)"
  );
  // allow bonusUnityTracker to stake stakedUnityTracker
  await sendTxn(
    stakedUnityTracker.setHandler(bonusUnityTracker.address, true),
    "stakedUnityTracker.setHandler(bonusUnityTracker)"
  );
  // allow rewardRouter to stake in bonusUnityTracker
  await sendTxn(
    bonusUnityTracker.setHandler(rewardRouter.address, true),
    "bonusUnityTracker.setHandler(rewardRouter)"
  );
  // allow bonusUnityTracker to stake feeUnityTracker
  await sendTxn(
    bonusUnityTracker.setHandler(feeUnityTracker.address, true),
    "bonusUnityTracker.setHandler(feeUnityTracker)"
  );
  await sendTxn(
    bonusUnityDistributor.setBonusMultiplier(20000),
    "bonusUnityDistributor.setBonusMultiplier"
  );
  // allow rewardRouter to stake in feeUnityTracker
  await sendTxn(
    feeUnityTracker.setHandler(rewardRouter.address, true),
    "feeUnityTracker.setHandler(rewardRouter)"
  );
  // allow stakedUnityTracker to stake esUnity
  await sendTxn(
    esUnity.setHandler(stakedUnityTracker.address, true),
    "esUnity.setHandler(stakedUnityTracker)"
  );
  // allow feeUnityTracker to stake bnUnity
  await sendTxn(
    bnUnity.setHandler(feeUnityTracker.address, true),
    "bnUnity.setHandler(feeUnityTracker"
  );
  // allow rewardRouter to burn bnUnity
  await sendTxn(
    bnUnity.setMinter(rewardRouter.address),
    "bnUnity.setMinter(rewardRouter"
  );

  // allow stakedUlpTracker to stake feeUlpTracker
  await sendTxn(
    feeUlpTracker.setHandler(stakedUlpTracker.address, true),
    "feeUlpTracker.setHandler(stakedUlpTracker)"
  );
  // allow feeUlpTracker to stake ulp
  await sendTxn(
    ulp.setHandler(feeUlpTracker.address, true),
    "ulp.setHandler(feeUlpTracker)"
  );

  // allow rewardRouter to stake in feeUlpTracker
  await sendTxn(
    feeUlpTracker.setHandler(rewardRouter.address, true),
    "feeUlpTracker.setHandler(rewardRouter)"
  );
  // allow rewardRouter to stake in stakedUlpTracker
  await sendTxn(
    stakedUlpTracker.setHandler(rewardRouter.address, true),
    "stakedUlpTracker.setHandler(rewardRouter)"
  );

  await sendTxn(
    esUnity.setHandler(rewardRouter.address, true),
    "esUnity.setHandler(rewardRouter)"
  );
  await sendTxn(
    esUnity.setHandler(stakedUnityDistributor.address, true),
    "esUnity.setHandler(stakedUnityDistributor)"
  );
  await sendTxn(
    esUnity.setHandler(stakedUlpDistributor.address, true),
    "esUnity.setHandler(stakedUlpDistributor)"
  );
  await sendTxn(
    esUnity.setHandler(stakedUlpTracker.address, true),
    "esUnity.setHandler(stakedUlpTracker)"
  );
  await sendTxn(
    esUnity.setHandler(unityVester.address, true),
    "esUnity.setHandler(unityVester)"
  );
  await sendTxn(
    esUnity.setHandler(ulpVester.address, true),
    "esUnity.setHandler(ulpVester)"
  );

  await sendTxn(
    esUnity.setMinter(unityVester.address),
    "esUnity.setMinter(unityVester)"
  );
  await sendTxn(
    esUnity.setMinter(ulpVester.address),
    "esUnity.setMinter(ulpVester)"
  );

  await sendTxn(
    unityVester.setHandler(rewardRouter.address, true),
    "unityVester.setHandler(rewardRouter)"
  );
  await sendTxn(
    ulpVester.setHandler(rewardRouter.address, true),
    "ulpVester.setHandler(rewardRouter)"
  );

  await sendTxn(
    feeUnityTracker.setHandler(unityVester.address, true),
    "feeUnityTracker.setHandler(unityVester)"
  );
  await sendTxn(
    stakedUlpTracker.setHandler(ulpVester.address, true),
    "stakedUlpTracker.setHandler(ulpVester)"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
