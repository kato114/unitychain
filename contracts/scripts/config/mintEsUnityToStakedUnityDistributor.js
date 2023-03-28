const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const { toUsd } = require("../../test/shared/units");
const { errors } = require("../../test/core/Vault/helpers");

async function main() {
  const esUNITY = await contractAt(
    "EsUNITY",
    "0x18F07fE5Eb220FB06717D4005CB76f1C203Df023"
  );

  const distributors = [
    "0xf45108532dC4A37a97627376E7FE6b3dA563C2ad",
    "0xc1011f844Ad5B8dEeA81bd1E1f507F81a068Ef0C",
  ];

  for (var i = 0; i < distributors.length; i++) {
    await sendTxn(
      esUNITY.mint(distributors[i], "10000000000000000000000000000"),
      "esUNITY.mint"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
