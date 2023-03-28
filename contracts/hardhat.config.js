require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-contract-sizer");
require("@typechain/hardhat");

const {
  POLYGONSCAN_API_KEY,
  POLYGON_DEPLOY_KEY,
  POLYGON_URL,
  BSCSCAN_API_KEY,
  BSC_DEPLOY_KEY,
  BSC_URL,
  OP_API_KEY,
  OP_DEPLOY_KEY,
  OP_URL,
  AB_API_KEY,
  AB_DEPLOY_KEY,
  AB_URL,
} = require("./env.json");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.info(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      timeout: 120000,
    },
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    polygon: {
      url: POLYGON_URL,
      gasPrice: 100000000000,
      chainId: 137,
      accounts: [POLYGON_DEPLOY_KEY],
    },
    bsc: {
      url: BSC_URL,
      gasPrice: 5000000000,
      chainId: 56,
      accounts: [BSC_DEPLOY_KEY],
    },
    optimisticEthereum: {
      url: OP_URL,
      gasPrice: 5000000,
      chainId: 10,
      accounts: [OP_DEPLOY_KEY],
    },
    arbitrumOne: {
      url: AB_URL,
      gasPrice: 500000000,
      chainId: 42161,
      accounts: [AB_DEPLOY_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      optimisticEthereum: OP_API_KEY,
      arbitrumOne: AB_API_KEY,
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};
