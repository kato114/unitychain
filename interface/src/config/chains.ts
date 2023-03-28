import { ethers } from "ethers";

const { parseEther } = ethers.utils;

// export const BSC = 56;
// export const POLYGON = 137;
// export const OPTIMISM = 10;
export const ARBITRUM = 42161;

export const DEFAULT_CHAIN_ID = ARBITRUM;
export const CHAIN_ID = DEFAULT_CHAIN_ID;

export const SUPPORTED_CHAIN_IDS = [ARBITRUM]; //BSC, POLYGON, OPTIMISM,

export const IS_NETWORK_DISABLED = {
  // [BSC]: true,
  // [POLYGON]: true,
  // [OPTIMISM]: true,
  [ARBITRUM]: false,
};

export const CHAIN_NAMES_MAP = {
  // [BSC]: "Bsc",
  // [POLYGON]: "Polygon",
  // [OPTIMISM]: "Optimism",
  [ARBITRUM]: "Arbitrum",
};

export const GAS_PRICE_ADJUSTMENT_MAP = {
  // [BSC]: "1000000000000",
  // [POLYGON]: "100000000000",
  // [OPTIMISM]: "100000000000",
  [ARBITRUM]: "10000000",
};

export const MAX_GAS_PRICE_MAP = {
  // [BSC]: "5000000000000", // 200 gwei
  // [POLYGON]: "100000000000", // 200 gwei
  // [OPTIMISM]: "5000000", // 200 gwei
  [ARBITRUM]: "2000000000", // 200 gwei
};

export const HIGH_EXECUTION_FEES_MAP = {
  // [BSC]: 3, // 3 USD
  // [POLYGON]: 3, // 3 USD
  // [OPTIMISM]: 3, // 3 USD
  [ARBITRUM]: 3, // 3 USD
};

const constants = {
  // [BSC]: {
  //   nativeTokenSymbol: "BNB",
  //   wrappedTokenSymbol: "WBNB",
  //   defaultCollateralSymbol: "USDC",
  //   defaultFlagOrdersEnabled: true,
  //   positionReaderPropsLength: 9,
  //   v2: true,

  //   SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
  //   INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
  //   // contract requires that execution fee be strictly greater than instead of gte
  //   DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.000300001"),
  // },

  // [POLYGON]: {
  //   nativeTokenSymbol: "MATIC",
  //   wrappedTokenSymbol: "WMATIC",
  //   defaultCollateralSymbol: "USDC",
  //   defaultFlagOrdersEnabled: true,
  //   positionReaderPropsLength: 9,
  //   v2: true,

  //   SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
  //   INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
  //   // contract requires that execution fee be strictly greater than instead of gte
  //   DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  // },

  // [OPTIMISM]: {
  //   nativeTokenSymbol: "ETH",
  //   wrappedTokenSymbol: "WETH",
  //   defaultCollateralSymbol: "USDC",
  //   defaultFlagOrdersEnabled: true,
  //   positionReaderPropsLength: 9,
  //   v2: true,

  //   SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
  //   INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
  //   // contract requires that execution fee be strictly greater than instead of gte
  //   DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  // },

  [ARBITRUM]: {
    nativeTokenSymbol: "ETH",
    wrappedTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  },
};

const ALCHEMY_WHITELISTED_DOMAINS = ["unity.io", "app.unity.io"];

export const POLYGON_RPC_PROVIDERS = ["https://polygon-rpc.com"];
export const OPTIMISM_RPC_PROVIDERS = ["https://optimistic.etherscan.io/"];
export const ARBITRUM_RPC_PROVIDERS = ["https://arb1.arbitrum.io/rpc"];

export const BSC_RPC_PROVIDERS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc-dataseed2.defibit.io",
  "https://bsc-dataseed3.defibit.io",
  "https://bsc-dataseed4.defibit.io",
  "https://bsc-dataseed2.ninicoin.io",
  "https://bsc-dataseed3.ninicoin.io",
  "https://bsc-dataseed4.ninicoin.io",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed3.binance.org",
  "https://bsc-dataseed4.binance.org",
];

export const RPC_PROVIDERS = {
  // [BSC]: BSC_RPC_PROVIDERS,
  // [POLYGON]: POLYGON_RPC_PROVIDERS,
  // [OPTIMISM]: OPTIMISM_RPC_PROVIDERS,
  [ARBITRUM]: ARBITRUM_RPC_PROVIDERS,
};

export const FALLBACK_PROVIDERS = {
  // [BSC]: ["https://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ"],
  // [POLYGON]: ["https://avax-mainnet.gateway.pokt.network/v1/lb/626f37766c499d003aada23b"],
  // [OPTIMISM]: ["https://avax-mainnet.gateway.pokt.network/v1/lb/626f37766c499d003aada23b"],
  [ARBITRUM]: ["https://avax-mainnet.gateway.pokt.network/v1/lb/626f37766c499d003aada23b"],
};

export const NETWORK_METADATA = {
  // [BSC]: {
  //   chainId: "0x" + BSC.toString(16),
  //   chainName: "BSC",
  //   nativeCurrency: {
  //     name: "BNB",
  //     symbol: "BNB",
  //     decimals: 18,
  //   },
  //   rpcUrls: BSC_RPC_PROVIDERS,
  //   blockExplorerUrls: ["https://bscscan.com"],
  // },
  // [POLYGON]: {
  //   chainId: "0x" + POLYGON.toString(16),
  //   chainName: "Polygon",
  //   nativeCurrency: {
  //     name: "MATIC",
  //     symbol: "MATIC",
  //     decimals: 18,
  //   },
  //   rpcUrls: POLYGON_RPC_PROVIDERS,
  //   blockExplorerUrls: [getExplorerUrl(POLYGON)],
  // },
  // [OPTIMISM]: {
  //   chainId: "0x" + OPTIMISM.toString(16),
  //   chainName: "Optimism",
  //   nativeCurrency: {
  //     name: "ETH",
  //     symbol: "ETH",
  //     decimals: 18,
  //   },
  //   rpcUrls: OPTIMISM_RPC_PROVIDERS,
  //   blockExplorerUrls: [getExplorerUrl(OPTIMISM)],
  // },
  [ARBITRUM]: {
    chainId: "0x" + ARBITRUM.toString(16),
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ARBITRUM_RPC_PROVIDERS,
    blockExplorerUrls: [getExplorerUrl(ARBITRUM)],
  },
};

export const getConstant = (chainId: number, key: string) => {
  if (!constants[chainId]) {
    throw new Error(`Unsupported chainId ${chainId}`);
  }

  if (!(key in constants[chainId])) {
    throw new Error(`Key ${key} does not exist for chainId ${chainId}`);
  }

  return constants[chainId][key];
};

export function getChainName(chainId: number) {
  return CHAIN_NAMES_MAP[chainId];
}

export function getAlchemyWsUrl() {
  if (ALCHEMY_WHITELISTED_DOMAINS.includes(window.location.host)) {
    return "wss://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ";
  }
  return "wss://arb-mainnet.g.alchemy.com/v2/EmVYwUw0N2tXOuG0SZfe5Z04rzBsCbr2";
}

export function getExplorerUrl(chainId) {
  // if (chainId === BSC) {
  //   return "https://bscscan.com/";
  // } else if (chainId === POLYGON) {
  //   return "https://polygonscan.com/";
  // } else if (chainId === OPTIMISM) {
  //   return "https://optimistic.etherscan.io/";
  // } else if (chainId === ARBITRUM) {
  //   return "https://arbiscan.io/";
  // }
  return "https://arbiscan.io/";
}

export function getHighExecutionFee(chainId) {
  return HIGH_EXECUTION_FEES_MAP[chainId] || 3;
}

export function isSupportedChain(chainId) {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}
