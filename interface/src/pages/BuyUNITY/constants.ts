import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { getContract } from "config/contracts";

// const BSC_UNITY = getContract(BSC, "UNITY");
// const POLYGON_UNITY = getContract(POLYGON, "UNITY");
// const OPTIMISM_UNITY = getContract(OPTIMISM, "UNITY");
const ARBITRUM_UNITY = getContract(ARBITRUM, "UNITY");

type Exchange = {
  name: string;
  icon: string;
  networks: number[];
  link?: string;
  links?: { [ARBITRUM]: string }; //[BSC]: string; [POLYGON]: string; [OPTIMISM]: string;
};

export const EXTERNAL_LINKS = {
  // [BSC]: {
  //   bungee: `https://multitx.bungee.exchange/?toChainId=42161&toTokenAddress=${BSC_UNITY}`,
  //   networkWebsite: "https://bsc.io/",
  //   buyUnity: {
  //     banxa: "https://unity.banxa.com/?coinType=UNITY&fiatType=USD&fiatAmount=500&blockchain=bsc",
  //     uniswap: `https://pancakeswap.finance/swap?outputCurrency=${BSC_UNITY}`,
  //   },
  // },
  // [POLYGON]: {
  //   bungee: `https://multitx.bungee.exchange/?toChainId=137&toTokenAddress=${POLYGON_UNITY}`,
  //   networkWebsite: "https://polygon.technology/",
  //   buyUnity: {
  //     traderjoe: `https://quickswap.exchange/#/swap?swapIndex=0&currency0=ETH&currency1=${POLYGON_UNITY}`,
  //   },
  // },
  // [OPTIMISM]: {
  //   bungee: `https://multitx.bungee.exchange/?toChainId=10&toTokenAddress=${OPTIMISM_UNITY}`,
  //   networkWebsite: "https://www.optimism.io/",
  //   buyUnity: {
  //     traderjoe: `https://app.uniswap.org/#/swap?swapIndex=0&currency0=ETH&currency1=${OPTIMISM_UNITY}`,
  //   },
  // },
  [ARBITRUM]: {
    bungee: `https://multitx.bungee.exchange/?toChainId=42161&toTokenAddress=${ARBITRUM_UNITY}`,
    networkWebsite: "https://arbitrum.io/",
    buyUnity: {
      traderjoe: `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${ARBITRUM_UNITY}`,
    },
  },
};

export const TRANSFER_EXCHANGES: Exchange[] = [
  {
    name: "Binance",
    icon: "ic_binance.svg",
    networks: [ARBITRUM], // BSC, POLYGON, OPTIMISM,
    link: "https://www.binance.com/en/trade/",
  },
  {
    name: "Synapse",
    icon: "ic_synapse.svg",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
    link: "https://synapseprotocol.com/",
  },
  // {
  //   name: "Bsc",
  //   icon: "ic_bsc_24.svg",
  //   networks: [BSC],
  //   link: "https://bridge.bsc.io/",
  // },
  // {
  //   name: "Polygon",
  //   icon: "ic_matic_30.svg",
  //   networks: [POLYGON],
  //   link: "https://bridge.matic.network/",
  // },
  // {
  //   name: "Optimism",
  //   icon: "ic_optimism_24.svg",
  //   networks: [OPTIMISM],
  //   link: "https://app.optimism.io/bridge",
  // },
  {
    name: "Arbitrum",
    icon: "ic_arbitrum_24.svg",
    networks: [ARBITRUM],
    link: "https://bridge.arbitrum.io/",
  },
  // {
  //   name: "Hop",
  //   icon: "ic_hop.svg",
  //   networks: [BSC],
  //   link: "https://app.hop.exchange/send?token=ETH&sourceNetwork=ethereum&destNetwork=bsc",
  // },
  {
    name: "Bungee",
    icon: "ic_bungee.png",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
    link: "https://multitx.bungee.exchange",
  },
  {
    name: "Multiswap",
    icon: "ic_multiswap.svg",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
    link: "https://app.multichain.org/#/router",
  },
  {
    name: "O3",
    icon: "ic_o3.png",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
    link: "https://o3swap.com/",
  },
  {
    name: "Across",
    icon: "ic_across.svg",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
    link: "https://across.to/",
  },
];

export const CENTRALISED_EXCHANGES: Exchange[] = [
  {
    name: "Binance",
    icon: "ic_binance.svg",
    link: "https://www.binance.com/en/trade/UNITY_USDT?_from=markets",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Bybit",
    icon: "ic_bybit.svg",
    link: "https://www.bybit.com/en-US/trade/spot/UNITY/USDT",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Kucoin",
    icon: "ic_kucoin.svg",
    link: "https://www.kucoin.com/trade/UNITY-USDT",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Huobi",
    icon: "ic_huobi.svg",
    link: "https://www.huobi.com/en-us/exchange/unity_usdt/",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
];

export const DECENTRALISED_AGGRIGATORS: Exchange[] = [
  {
    name: "1inch",
    icon: "ic_1inch.svg",
    links: {
      // [BSC]: "https://app.1inch.io/#/56/unified/swap/BNB/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
      // [POLYGON]: "https://app.1inch.io/#/137/unified/swap/MATIC/0x205876c491A157343F338A1CE0559fD276865Ea1",
      // [OPTIMISM]: "https://app.1inch.io/#/10/unified/swap/ETH/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
      [ARBITRUM]: "https://app.1inch.io/#/43114/unified/swap/ETH/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
    },
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Matcha",
    icon: "ic_matcha.png",
    links: {
      // [BSC]: `https://www.matcha.xyz/markets/56/${BSC_UNITY}`,
      // [POLYGON]: `https://www.matcha.xyz/markets/137/${POLYGON_UNITY}`,
      // [OPTIMISM]: `https://www.matcha.xyz/markets/10/${OPTIMISM_UNITY}`,
      [ARBITRUM]: `https://www.matcha.xyz/markets/43114/${ARBITRUM_UNITY}`,
    },
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Paraswap",
    icon: "ic_paraswap.svg",
    links: {
      // [BSC]: "https://app.paraswap.io/#/?network=bsc",
      // [POLYGON]: "https://app.paraswap.io/#/?network=polygon",
      // [OPTIMISM]: "https://app.paraswap.io/#/?network=optimism",
      [ARBITRUM]: "https://app.paraswap.io/#/?network=arbitrum",
    },
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Firebird",
    icon: "ic_firebird.png",
    link: "https://app.firebird.finance/swap",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "OpenOcean",
    icon: "ic_openocean.svg",
    links: {
      // [BSC]: "https://app.openocean.finance/CLASSIC#/BSC/BNB/UNITY",
      // [POLYGON]: "https://app.openocean.finance/CLASSIC#/MATIC/MATIC/UNITY",
      // [OPTIMISM]: "https://app.openocean.finance/CLASSIC#/OPTIMISM/ETH/UNITY",
      [ARBITRUM]: "https://app.openocean.finance/CLASSIC#/ARBITRUM/ETH/UNITY",
    },
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "DODO",
    icon: "ic_dodo.svg",
    links: {
      // [BSC]: `https://app.dodoex.io/?from=ETH&to=${BSC_UNITY}&network=bsc`,
      // [POLYGON]: `https://app.dodoex.io/?from=MATIC&to=${POLYGON_UNITY}&network=polygon`,
      // [OPTIMISM]: `https://app.dodoex.io/?from=ETH&to=${OPTIMISM_UNITY}&network=optimism`,
      [ARBITRUM]: `https://app.dodoex.io/?from=ETH&to=${ARBITRUM_UNITY}&network=arbitrum`,
    },
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  // {
  //   name: "Odos",
  //   icon: "ic_odos.png",
  //   link: "https://app.odos.xyz/",
  //   networks: [BSC],
  // },
  {
    name: "Slingshot",
    icon: "ic_slingshot.svg",
    link: "https://app.slingshot.finance/swap/ETH",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
  {
    name: "Yieldyak",
    icon: "ic_yield_yak.png",
    link: "https://yieldyak.com/swap",
    networks: [ARBITRUM], //BSC, POLYGON, OPTIMISM,
  },
];
