const {
  deployContract,
  contractAt,
  writeTmpAddresses,
  sendTxn,
} = require("../shared/helpers");

async function main() {
  const tokenManager = await deployContract(
    "TokenManager",
    [1],
    "TokenManager"
  );

  const signers = ["0x98811E850D7E67b3f868370495364fD7B9522030"];

  await sendTxn(tokenManager.initialize(signers), "tokenManager.initialize");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
