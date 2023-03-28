const {
  deployContract,
  contractAt,
  writeTmpAddresses,
} = require("../shared/helpers");

async function main() {
  await deployContract("EsUNITY", []);
  await deployContract("MintableBaseToken", ["EsUNITY IOU", "EsUNITY:IOU", 0]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
