const {
  deployContract,
  contractAt,
  sendTxn,
  getFrameSigner,
} = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");

const network = process.env.HARDHAT_NETWORK || "mainnet";

async function getValues() {
  const vault = await contractAt(
    "Vault",
    "0x22e207058B094278801bb686554b54D2A1266028"
  );
  const tokenManager = {
    address: "0x5769865bEd39EFCD84874B6862CDAe0A9C6d712B",
  };
  const ulpManager = { address: "0x2F8Ce29026af7561891d7D92625DC5E450871598" };

  const positionRouter = {
    address: "0x451b365552243bE3B55eA995865DFf49d124Eb96",
  };
  const positionManager = {
    address: "0x62C96021C3d69E1b6512058f49a4af38f54ED18a",
  };
  const unityChain = { address: "0x9C36A6726aC539066EA6572587bc658D62E59F2d" };

  return {
    vault,
    tokenManager,
    ulpManager,
    positionRouter,
    positionManager,
    unityChain,
  };
}

async function main() {
  const admin = "0x98811E850D7E67b3f868370495364fD7B9522030";
  const buffer = 0;
  const maxTokenSupply = expandDecimals("13250000", 18);

  const {
    vault,
    tokenManager,
    ulpManager,
    positionRouter,
    positionManager,
    unityChain,
  } = await getValues();
  const mintReceiver = tokenManager;

  const timelock = await deployContract(
    "Timelock",
    [
      admin,
      buffer,
      tokenManager.address,
      mintReceiver.address,
      ulpManager.address,
      maxTokenSupply,
      10,
      500,
    ],
    "Timelock"
  );

  const deployedTimelock = await contractAt("Timelock", timelock.address);
  // const deployedTimelock = await contractAt(
  //   "Timelock",
  //   "0x3402CeEFF69B904581c5717380006B52236046c7"
  // );

  await sendTxn(
    deployedTimelock.setShouldToggleIsLeverageEnabled(true),
    "deployedTimelock.setShouldToggleIsLeverageEnabled(true)"
  );
  await sendTxn(
    deployedTimelock.setContractHandler(positionRouter.address, true),
    "deployedTimelock.setContractHandler(positionRouter)"
  );
  await sendTxn(
    deployedTimelock.setContractHandler(positionManager.address, true),
    "deployedTimelock.setContractHandler(positionManager)"
  );

  // update gov of vault
  const vaultGov = await contractAt("Timelock", await vault.gov());
  await sendTxn(
    vaultGov.signalSetGov(vault.address, deployedTimelock.address),
    "vaultGov.signalSetGov"
  );
  await sendTxn(
    deployedTimelock.signalSetGov(vault.address, vaultGov.address),
    "deployedTimelock.signalSetGov(vault)"
  );

  const signers = ["0x98811E850D7E67b3f868370495364fD7B9522030"];

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    await sendTxn(
      deployedTimelock.setContractHandler(signer, true),
      `deployedTimelock.setContractHandler(${signer})`
    );
  }

  const keepers = [
    "0x98811E850D7E67b3f868370495364fD7B9522030", // X
  ];

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i];
    await sendTxn(
      deployedTimelock.setKeeper(keeper, true),
      `deployedTimelock.setKeeper(${keeper})`
    );
  }

  await sendTxn(
    deployedTimelock.signalApprove(
      unityChain.address,
      admin,
      "100000000000000000000000000000"
    ),
    "deployedTimelock.signalApprove"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
