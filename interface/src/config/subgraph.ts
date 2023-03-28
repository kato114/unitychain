import { ARBITRUM } from "./chains"; //, BSC, OPTIMISM, POLYGON

export const SUBGRAPH_URLS = {
  // [BSC]: {
  //   stats: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-bsc-stats",
  //   referrals: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-bsc-referrals",
  //   trades: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-bsc-trades",
  // },

  // [POLYGON]: {
  //   stats: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-stats",
  //   referrals: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-referrals",
  //   trades: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-trades",
  // },

  // [OPTIMISM]: {
  //   stats: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-op-stats",
  //   referrals: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-op-referrals",
  //   trades: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-op-trades",
  // },

  [ARBITRUM]: {
    stats: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-arb-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-arb-referrals",
    trades: "https://api.thegraph.com/subgraphs/name/pos-ninja/unitychain-arb-trades",
  },

  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
  },
};
