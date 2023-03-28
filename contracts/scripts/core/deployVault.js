const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const { errors } = require("../../test/core/Vault/helpers");

const network = process.env.HARDHAT_NETWORK || "mainnet";
const tokens = require("./tokens")[network];

async function main() {
  const { nativeToken } = tokens;

  // const vault = await deployContract("Vault", []);
  // const usdg = await deployContract("USDG", [vault.address]);
  // const router = await deployContract("Router", [
  //   vault.address,
  //   usdg.address,
  //   nativeToken.address,
  // ]);
  // const vaultPriceFeed = await deployContract("VaultPriceFeed", []);

  const vault = await contractAt(
    "Vault",
    "0x22e207058B094278801bb686554b54D2A1266028"
  );
  const usdg = await contractAt(
    "USDG",
    "0x8E67Ecd4B2C0d1C81ec008081ff082F42f427e75"
  );
  const router = await contractAt(
    "Router",
    "0x9129C825ec9f7b033909497B3a1275921C8Accac"
  );
  const vaultPriceFeed = await contractAt(
    "VaultPriceFeed",
    "0x176C440866992007E932E2A3633E46F99D3c46B3"
  );
  // const secondaryPriceFeed = await deployContract("FastPriceFeed", [5 * 60])

  // await sendTxn(
  //   vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)),
  //   "vaultPriceFeed.setMaxStrictPriceDeviation"
  // ); // 0.05 USD
  // await sendTxn(
  //   vaultPriceFeed.setPriceSampleSpace(1),
  //   "vaultPriceFeed.setPriceSampleSpace"
  // );
  // await sendTxn(
  //   vaultPriceFeed.setIsAmmEnabled(false),
  //   "vaultPriceFeed.setIsAmmEnabled"
  // );

  // const ulp = await deployContract("ULP", []);
  const ulp = await contractAt(
    "ULP",
    "0xc826631aBF70fa6ED0bb12076e033E770FCc9093"
  );
  // await sendTxn(
  //   ulp.setInPrivateTransferMode(true),
  //   "ulp.setInPrivateTransferMode"
  // );

  // const ulpManager = await deployContract("UlpManager", [
  //   vault.address,
  //   usdg.address,
  //   ulp.address,
  //   15 * 60,
  // ]);
  const ulpManager = await contractAt(
    "UlpManager",
    "0x2F8Ce29026af7561891d7D92625DC5E450871598"
  );

  // await sendTxn(
  //   ulpManager.setInPrivateMode(true),
  //   "ulpManager.setInPrivateMode"
  // );

  await sendTxn(ulp.setMinter(ulpManager.address), "ulp.setMinter");
  await sendTxn(usdg.addVault(ulpManager.address), "usdg.addVault(ulpManager)");

  await sendTxn(
    vault.initialize(
      router.address, // router
      usdg.address, // usdg
      vaultPriceFeed.address, // priceFeed
      toUsd(2), // liquidationFeeUsd
      100, // fundingRateFactor
      100 // stableFundingRateFactor
    ),
    "vault.initialize"
  );

  await sendTxn(
    vault.setFundingRate(60 * 60, 100, 100),
    "vault.setFundingRate"
  );

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode");
  await sendTxn(vault.setManager(ulpManager.address, true), "vault.setManager");

  await sendTxn(
    vault.setFees(
      10, // _taxBasisPoints
      5, // _stableTaxBasisPoints
      20, // _mintBurnFeeBasisPoints
      20, // _swapFeeBasisPoints
      1, // _stableSwapFeeBasisPoints
      10, // _marginFeeBasisPoints
      toUsd(2), // _liquidationFeeUsd
      24 * 60 * 60, // _minProfitTime
      true // _hasDynamicFees
    ),
    "vault.setFees"
  );

  const vaultErrorController = await deployContract("VaultErrorController", []);
  // const vaultErrorController = await contractAt(
  //   "VaultErrorController",
  //   "0x3E1f69a3D8DC6dF2402E7b610Fa9F7cCa9A12C45"
  // );
  await sendTxn(
    vault.setErrorController(vaultErrorController.address),
    "vault.setErrorController"
  );
  await sendTxn(
    vaultErrorController.setErrors(vault.address, errors),
    "vaultErrorController.setErrors"
  );

  const vaultUtils = await deployContract("VaultUtils", [vault.address]);
  await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
