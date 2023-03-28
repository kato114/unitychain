import { ethers } from "ethers";
import { getContract } from "./contracts";
import { ARBITRUM } from "./chains"; //, BSC, OPTIMISM, POLYGON
import { Token } from "domain/tokens";

export const TOKENS: { [chainId: number]: Token[] } = {
  // [BSC]: [
  //   {
  //     name: "BNB",
  //     symbol: "BNB",
  //     decimals: 18,
  //     address: ethers.constants.AddressZero,
  //     isNative: true,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png",
  //   },
  //   {
  //     name: "Wrapped BNB",
  //     symbol: "WBNB",
  //     decimals: 18,
  //     address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  //     isWrapped: true,
  //     baseSymbol: "BNB",
  //     imageUrl: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png",
  //   },
  //   {
  //     name: "Matic Token",
  //     symbol: "MATIC",
  //     decimals: 18,
  //     address: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
  //     isWrapped: true,
  //     baseSymbol: "MATIC",
  //     imageUrl: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png",
  //   },
  //   {
  //     name: "Binance-Peg Ethereum Token",
  //     symbol: "ETH",
  //     address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  //     decimals: 18,
  //     isShortable: true,
  //     baseSymbol: "ETH",
  //     imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
  //   },
  //   {
  //     name: "Binance-Peg BTCB Token",
  //     symbol: "BTC",
  //     address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  //     decimals: 18,
  //     isShortable: true,
  //     baseSymbol: "BTC",
  //     imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
  //   },
  //   {
  //     name: "Solana",
  //     symbol: "SOL",
  //     address: "0xFEa6aB80cd850c3e63374Bc737479aeEC0E8b9a1",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
  //   },
  //   {
  //     name: "Binance-Peg Dogecoin Token",
  //     symbol: "DOGE",
  //     address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  //     decimals: 8,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13796/thumb/Dogecoin.jpg",
  //   },
  //   {
  //     name: "Binance-Peg Avalanche Token",
  //     symbol: "AVAX",
  //     address: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png",
  //   },
  //   {
  //     name: "1INCH Token",
  //     symbol: "1INCH",
  //     address: "0x111111111117dC0aa78b770fA6A738034120C302",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png",
  //   },
  //   {
  //     name: "Binance-Peg Aave Token",
  //     symbol: "AAVE",
  //     address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png",
  //   },
  //   {
  //     name: "Wootrade Network",
  //     symbol: "WOO",
  //     address: "0x4691937a7508860F876c9c0a2a617E7d9E945D4B",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12921/thumb/w2UiemF__400x400.jpg",
  //   },
  //   {
  //     name: "ChainLink",
  //     symbol: "LINK",
  //     address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
  //   },
  //   {
  //     name: "Binance-Peg SushiToken",
  //     symbol: "SUSHI",
  //     address: "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12271/thumb/512x512_Logo_no_chop.png",
  //   },
  //   {
  //     name: "CAKE",
  //     symbol: "CAKE",
  //     address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12632/thumb/pancakeswap-cake-logo_%281%29.png",
  //   },
  //   {
  //     name: "BISWAP",
  //     symbol: "BISWAP",
  //     address: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/16845/thumb/biswap.png",
  //   },
  //   {
  //     name: "SHIBA",
  //     symbol: "SHIBA",
  //     address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/20003/thumb/output-onlinepngtools_%2810%29.png",
  //   },
  //   {
  //     name: "ATOM",
  //     symbol: "ATOM",
  //     address: "0x0Eb3a705fc54725037CC9e008bDede697f62F335",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png",
  //   },
  //   {
  //     name: "Axie Infinity",
  //     symbol: "AXS",
  //     address: "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13029/thumb/axie_infinity_logo.png",
  //   },
  //   {
  //     name: "Fantom",
  //     symbol: "FTM",
  //     address: "0xAD29AbB318791D579433D831ed122aFeAf29dcfe",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/4001/thumb/Fantom_round.png",
  //   },
  //   {
  //     name: "Binance-COMPOUND",
  //     symbol: "COMP",
  //     address: "0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/10775/thumb/COMP.png",
  //   },
  //   {
  //     name: "Fetch",
  //     symbol: "FETCH",
  //     address: "0x031b41e504677879370e9DBcF937283A8691Fa7f",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg",
  //   },
  //   {
  //     name: "MASK",
  //     symbol: "MASK",
  //     address: "0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/14051/thumb/Mask_Network.jpg",
  //   },
  //   {
  //     name: "ONT",
  //     symbol: "ONT",
  //     address: "0xFd7B3A77848f1C2D67E05E54d78d174a0C850335",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/3447/thumb/ONT.png",
  //   },
  //   {
  //     name: "SXP",
  //     symbol: "SXP",
  //     address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/9368/thumb/swipe.png",
  //   },
  //   {
  //     name: "INJ",
  //     symbol: "INJ",
  //     address: "0xa2B726B1145A4773F68593CF171187d8EBe4d495",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12882/thumb/Secondary_Symbol.png",
  //   },
  //   {
  //     name: "CHR",
  //     symbol: "CHR",
  //     address: "0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/5000/thumb/Chromia.png",
  //   },
  //   {
  //     name: "XVS",
  //     symbol: "XVS",
  //     address: "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12677/thumb/download.jpg",
  //   },
  //   {
  //     name: "USDC",
  //     symbol: "USDC",
  //     address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  //   },
  //   {
  //     name: "USDT",
  //     symbol: "USDT",
  //     address: "0x55d398326f99059fF775485246999027B3197955",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  //   },
  //   {
  //     name: "BUSD",
  //     symbol: "BUSD",
  //     address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png",
  //   },
  //   {
  //     name: "Frax",
  //     symbol: "FRAX",
  //     address: "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13422/thumb/ethCanonicalFRAX.png",
  //   },
  // ],
  // [POLYGON]: [
  //   {
  //     name: "Matic",
  //     symbol: "MATIC",
  //     decimals: 18,
  //     address: ethers.constants.AddressZero,
  //     isNative: true,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png",
  //   },
  //   {
  //     name: "Wrapped MATIC",
  //     symbol: "WMATIC",
  //     decimals: 18,
  //     address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //     isWrapped: true,
  //     baseSymbol: "MATIC",
  //     imageUrl: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png",
  //   },
  //   {
  //     name: "Wrapped Ether",
  //     symbol: "ETH",
  //     address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  //     decimals: 18,
  //     isShortable: true,
  //     baseSymbol: "ETH",
  //     imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
  //   },
  //   {
  //     name: "(PoS) Wrapped BTC",
  //     symbol: "BTC",
  //     address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  //     decimals: 8,
  //     isShortable: true,
  //     baseSymbol: "BTC",
  //     imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
  //   },
  //   {
  //     name: "CRV (PoS)",
  //     symbol: "CRV",
  //     address: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
  //     decimals: 18,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12124/thumb/Curve.png",
  //   },
  //   {
  //     name: "SOL",
  //     symbol: "SOL",
  //     address: "0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
  //   },
  //   {
  //     name: "renDOGE",
  //     symbol: "renDOGE",
  //     address: "0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
  //     decimals: 8,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13796/thumb/Dogecoin.jpg",
  //   },
  //   {
  //     name: "Avalanche Token",
  //     symbol: "AVAX",
  //     address: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png",
  //   },
  //   {
  //     name: "SAND",
  //     symbol: "SAND",
  //     address: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12129/thumb/sandbox_logo.jpg",
  //   },
  //   {
  //     name: "Decentraland",
  //     symbol: "MANA",
  //     address: "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/878/thumb/decentraland-mana.png",
  //   },
  //   {
  //     name: "1INCH Token",
  //     symbol: "1INCH",
  //     address: "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png",
  //   },
  //   {
  //     name: "ApeCoin (PoS)",
  //     symbol: "APE",
  //     address: "0xB7b31a6BC18e48888545CE79e83E06003bE70930",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/24383/thumb/apecoin.jpg",
  //   },
  //   {
  //     name: "Synthetix Network Token (PoS)",
  //     symbol: "SNX",
  //     address: "0x50B728D8D964fd00C2d0AAD81718b71311feF68a",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/3406/thumb/SNX.png",
  //   },
  //   {
  //     name: "Aave (PoS)",
  //     symbol: "AAVE",
  //     address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png",
  //   },
  //   {
  //     name: "Wootrade Network",
  //     symbol: "WOO",
  //     address: "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12921/thumb/w2UiemF__400x400.jpg",
  //   },
  //   {
  //     name: "ChainLink",
  //     symbol: "LINK",
  //     address: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
  //   },
  //   {
  //     name: "Maker",
  //     symbol: "MKR",
  //     address: "0x6f7C932e7684666C9fd1d44527765433e01fF61d",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/1364/thumb/Mark_Maker.png",
  //   },
  //   {
  //     name: "SushiToken (PoS)",
  //     symbol: "SUSHI",
  //     address: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12271/thumb/512x512_Logo_no_chop.png",
  //   },
  //   {
  //     name: "chiliZ",
  //     symbol: "CHZ",
  //     address: "0xf1938Ce12400f9a761084E7A80d37e732a4dA056",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/8834/thumb/Chiliz.png",
  //   },
  //   {
  //     name: "OMG Network",
  //     symbol: "OMG",
  //     address: "0x62414D03084EeB269E18C970a21f45D2967F0170",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/776/thumb/OMG_Network.jpg",
  //   },
  //   {
  //     name: "FXS",
  //     symbol: "FXS",
  //     address: "0x1a3acf6D19267E2d3e7f898f42803e90C9219062",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13423/thumb/ethCanonicalFXS.png",
  //   },
  //   {
  //     name: "BAT",
  //     symbol: "BAT",
  //     address: "0x3Cef98bb43d732E2F285eE605a8158cDE967D219",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/677/thumb/basic-attention-token.png",
  //   },
  //   {
  //     name: "ZRX",
  //     symbol: "ZRX",
  //     address: "0x5559Edb74751A0edE9DeA4DC23aeE72cCA6bE3D5",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/863/thumb/0x.png",
  //   },
  //   {
  //     name: "OCEAN",
  //     symbol: "OCEAN",
  //     address: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/3687/thumb/ocean-protocol-logo.jpg",
  //   },
  //   {
  //     name: "COMP",
  //     symbol: "COMP",
  //     address: "0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/10775/thumb/COMP.png",
  //   },
  //   {
  //     name: "USDC",
  //     symbol: "USDC",
  //     address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  //     decimals: 6,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  //   },
  //   {
  //     name: "USDT",
  //     symbol: "USDT",
  //     address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  //     decimals: 6,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  //   },
  //   {
  //     name: "DAI",
  //     symbol: "DAI",
  //     address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png",
  //   },
  //   {
  //     name: "Frax",
  //     symbol: "FRAX",
  //     address: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13422/thumb/ethCanonicalFRAX.png",
  //   },
  // ],
  // [OPTIMISM]: [
  //   {
  //     name: "ETH",
  //     symbol: "ETH",
  //     decimals: 18,
  //     address: ethers.constants.AddressZero,
  //     isNative: true,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
  //   },
  //   {
  //     name: "Wrapped ETH",
  //     symbol: "WETH",
  //     decimals: 18,
  //     address: "0x4200000000000000000000000000000000000006",
  //     isWrapped: true,
  //     baseSymbol: "ETH",
  //     imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
  //   },
  //   {
  //     name: "BTC",
  //     symbol: "BTC",
  //     address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
  //     decimals: 8,
  //     isShortable: true,
  //     baseSymbol: "BTC",
  //     imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
  //   },
  //   {
  //     name: "Aave",
  //     symbol: "AAVE",
  //     address: "0x76FB31fb4af56892A25e32cFC43De717950c9278",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png",
  //   },
  //   {
  //     name: "ChainLink",
  //     symbol: "LINK",
  //     address: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
  //   },
  //   {
  //     name: "LIDO",
  //     symbol: "LIDO",
  //     address: "0xFdb794692724153d1488CcdBE0C56c252596735F",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13573/thumb/Lido_DAO.png",
  //   },
  //   {
  //     name: "UNI",
  //     symbol: "UNI",
  //     address: "0x6fd9d7AD17242c41f7131d257212c54A0e816691",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png",
  //   },
  //   {
  //     name: "SNX",
  //     symbol: "SNX",
  //     address: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/3406/thumb/SNX.png",
  //   },
  //   {
  //     name: "OP",
  //     symbol: "OP",
  //     address: "0x4200000000000000000000000000000000000042",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/25244/thumb/Optimism.png",
  //   },
  //   {
  //     name: "BALANCER",
  //     symbol: "BALANCER",
  //     address: "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921",
  //     decimals: 18,
  //     isStable: false,
  //     isShortable: true,
  //     imageUrl: "https://assets.coingecko.com/coins/images/11683/thumb/Balancer.png",
  //   },
  //   {
  //     name: "USDC",
  //     symbol: "USDC",
  //     address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  //     decimals: 6,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  //   },
  //   {
  //     name: "USDT",
  //     symbol: "USDT",
  //     address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  //     decimals: 6,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  //   },
  //   {
  //     name: "DAI",
  //     symbol: "DAI",
  //     address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png",
  //   },
  //   {
  //     name: "Frax",
  //     symbol: "FRAX",
  //     address: "0x2E3D870790dC77A83DD1d18184Acc7439A53f475",
  //     decimals: 18,
  //     isStable: true,
  //     isShortable: false,
  //     imageUrl: "https://assets.coingecko.com/coins/images/13422/thumb/ethCanonicalFRAX.png",
  //   },
  // ],
  [ARBITRUM]: [
    {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
      address: ethers.constants.AddressZero,
      isNative: true,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
    },
    {
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      isWrapped: true,
      baseSymbol: "ETH",
      imageUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880",
    },
    {
      name: "BNB",
      symbol: "BNB",
      address: "0x20865e63B111B2649ef829EC220536c82C58ad7B",
      decimals: 18,
      isShortable: true,
      baseSymbol: "BNB",
      imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
    },
    {
      name: "BTC",
      symbol: "BTC",
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      decimals: 8,
      isShortable: true,
      baseSymbol: "BTC",
      imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
    },
    {
      name: "Aave",
      symbol: "AAVE",
      address: "0x078f358208685046a11C85e8ad32895DED33A249",
      decimals: 8,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png",
    },
    {
      name: "ChainLink",
      symbol: "LINK",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
    },
    {
      name: "UNI",
      symbol: "UNI",
      address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png",
    },
    // {
    //   name: "LIDO",
    //   symbol: "LIDO",
    //   address: "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
    //   decimals: 18,
    //   isStable: false,
    //   isShortable: true,
    //   imageUrl: "https://assets.coingecko.com/coins/images/13573/thumb/Lido_DAO.png",
    // },
    {
      name: "CURVE",
      symbol: "CURVE",
      address: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/12124/thumb/Curve.png",
    },
    {
      name: "GMX",
      symbol: "GMX",
      address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/18323/thumb/arbit.png",
    },
    {
      name: "BALANCER",
      symbol: "BAL",
      address: "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/11683/thumb/Balancer.png",
    },
    // {
    //   name: "MAGIC",
    //   symbol: "MAGIC",
    //   address: "0x2c852D3334188BE136bFC540EF2bB8C37b590BAD",
    //   decimals: 18,
    //   isStable: false,
    //   isShortable: true,
    //   imageUrl: "https://assets.coingecko.com/nft_contracts/images/2351/thumb/magiccraft-genesis-characters.jpg",
    // },
    {
      name: "KNC",
      symbol: "KNC",
      address: "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/14899/thumb/RwdVsGcw_400x400.jpg",
    },
    {
      name: "DPX",
      symbol: "DPX",
      address: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/16652/thumb/DPX_%281%29.png",
    },
    {
      name: "DODO",
      symbol: "DODO",
      address: "0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
      decimals: 18,
      isStable: false,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/12651/thumb/dodo_logo.png",
    },
    {
      name: "USDC",
      symbol: "USDC",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      isStable: true,
      isShortable: false,
      imageUrl: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
    },
    {
      name: "USDT",
      symbol: "USDT",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      isStable: true,
      isShortable: false,
      imageUrl: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
    },
    {
      name: "DAI",
      symbol: "DAI",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      isStable: true,
      isShortable: false,
      imageUrl: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png",
    },
    {
      name: "Frax",
      symbol: "FRAX",
      address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      decimals: 18,
      isStable: true,
      isShortable: false,
      imageUrl: "https://assets.coingecko.com/coins/images/13422/thumb/ethCanonicalFRAX.png",
    },
  ],
};

export const ADDITIONAL_TOKENS: { [chainId: number]: Token[] } = {
  // [BSC]: [
  //   {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     address: getContract(BSC, "UNITY"),
  //     decimals: 18,
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   {
  //     name: "Escrowed Unity",
  //     symbol: "esUNITY",
  //     address: getContract(BSC, "ES_UNITY"),
  //     decimals: 18,
  //   },
  //   {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     address: getContract(BSC, "ULP"),
  //     decimals: 18,
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // ],
  // [POLYGON]: [
  //   {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     address: getContract(POLYGON, "UNITY"),
  //     decimals: 18,
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   {
  //     name: "Escrowed Unity",
  //     symbol: "esUNITY",
  //     address: getContract(POLYGON, "ES_UNITY"),
  //     decimals: 18,
  //   },
  //   {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     address: getContract(POLYGON, "ULP"),
  //     decimals: 18,
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // ],
  // [OPTIMISM]: [
  //   {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     address: getContract(OPTIMISM, "UNITY"),
  //     decimals: 18,
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   {
  //     name: "Escrowed Unity",
  //     symbol: "esUNITY",
  //     address: getContract(OPTIMISM, "ES_UNITY"),
  //     decimals: 18,
  //   },
  //   {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     address: getContract(OPTIMISM, "ULP"),
  //     decimals: 18,
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // ],
  [ARBITRUM]: [
    {
      name: "UnityChain",
      symbol: "$UNITY",
      address: getContract(ARBITRUM, "UNITY"),
      decimals: 18,
      imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
    },
    {
      name: "Escrowed Unity",
      symbol: "esUNITY",
      address: getContract(ARBITRUM, "ES_UNITY"),
      decimals: 18,
    },
    {
      name: "$ULP",
      symbol: "$ULP",
      address: getContract(ARBITRUM, "ULP"),
      decimals: 18,
      imageUrl:
        "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
    },
  ],
};

export const PLATFORM_TOKENS: { [chainId: number]: { [symbol: string]: Token } } = {
  // [BSC]: {
  //   // bsc{
  //   // polygon
  //   UNITY: {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     decimals: 18,
  //     address: getContract(BSC, "UNITY"),
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   ULP: {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     decimals: 18,
  //     address: getContract(BSC, "StakedUlpTracker"), // address of fsULP token because user only holds fsULP
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // },
  // [POLYGON]: {
  //   // polygon
  //   UNITY: {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     decimals: 18,
  //     address: getContract(POLYGON, "UNITY"),
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   ULP: {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     decimals: 18,
  //     address: getContract(POLYGON, "StakedUlpTracker"), // address of fsULP token because user only holds fsULP
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // },
  // [OPTIMISM]: {
  //   // polygon
  //   UNITY: {
  //     name: "UnityChain",
  //     symbol: "$UNITY",
  //     decimals: 18,
  //     address: getContract(OPTIMISM, "UNITY"),
  //     imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  //   },
  //   ULP: {
  //     name: "$ULP",
  //     symbol: "$ULP",
  //     decimals: 18,
  //     address: getContract(OPTIMISM, "StakedUlpTracker"), // address of fsULP token because user only holds fsULP
  //     imageUrl:
  //       "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
  //   },
  // },
  [ARBITRUM]: {
    // polygon
    UNITY: {
      name: "UnityChain",
      symbol: "$UNITY",
      decimals: 18,
      address: getContract(ARBITRUM, "UNITY"),
      imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
    },
    ULP: {
      name: "$ULP",
      symbol: "$ULP",
      decimals: 18,
      address: getContract(ARBITRUM, "StakedUlpTracker"), // address of fsULP token because user only holds fsULP
      imageUrl:
        "https://github.com/UnityChain-Dex/unity-assets/blob/main/UNITY-Assets/PNG/ULP_LOGO%20ONLY.png?raw=true",
    },
  },
};

export const ICONLINKS = {
  // [BSC]: {
  //   UNITY: {
  //     bsc: "https://bscscan.com/address/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
  //   },
  //   ULP: {
  //     bsc: "https://bscscan.com/address/0xe0C401e55C993b6bC808Ff2b1f75f29a5DbC5DFD",
  //   },
  //   BNB: {
  //     coingecko: "https://www.coingecko.com/en/coins/bnb",
  //     bsc: "https://bscscan.com/address/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  //   },
  //   MATIC: {
  //     coingecko: "https://www.coingecko.com/en/coins/polygon",
  //     bsc: "https://bscscan.com/address/0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
  //   },
  //   ETH: {
  //     coingecko: "https://www.coingecko.com/en/coins/ethereum",
  //     bsc: "https://bscscan.com/address/0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  //   },
  //   BTC: {
  //     coingecko: "https://www.coingecko.com/en/coins/bitcoin",
  //     bsc: "https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  //   },
  //   SOL: {
  //     coingecko: "https://www.coingecko.com/en/coins/solana",
  //     bsc: "https://bscscan.com/address/0xFEa6aB80cd850c3e63374Bc737479aeEC0E8b9a1",
  //   },
  //   DOGE: {
  //     coingecko: "https://www.coingecko.com/en/coins/rendoge",
  //     bsc: "https://bscscan.com/address/0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  //   },
  //   AVAX: {
  //     coingecko: "https://www.coingecko.com/en/coins/avalanche",
  //     bsc: "https://bscscan.com/address/0x1CE0c2827e2eF14D5C4f29a091d735A204794041",
  //   },
  //   "1INCH": {
  //     coingecko: "https://www.coingecko.com/en/coins/1inch",
  //     bsc: "https://bscscan.com/address/0x111111111117dC0aa78b770fA6A738034120C302",
  //   },
  //   AAVE: {
  //     coingecko: "https://www.coingecko.com/en/coins/aave",
  //     bsc: "https://bscscan.com/address/0xfb6115445Bff7b52FeB98650C87f44907E58f802",
  //   },
  //   WOO: {
  //     coingecko: "https://www.coingecko.com/en/coins/woo-network",
  //     bsc: "https://bscscan.com/address/0x4691937a7508860F876c9c0a2a617E7d9E945D4B",
  //   },
  //   LINK: {
  //     coingecko: "https://www.coingecko.com/en/coins/chainlink",
  //     bsc: "https://bscscan.com/address/0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  //   },
  //   SUSHI: {
  //     coingecko: "https://www.coingecko.com/en/coins/sushi",
  //     bsc: "https://bscscan.com/address/0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",
  //   },
  //   CAKE: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  //   },
  //   BISWAP: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  //   },
  //   SHIBA: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
  //   },
  //   ATOM: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x0Eb3a705fc54725037CC9e008bDede697f62F335",
  //   },
  //   AXS: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0",
  //   },
  //   FTM: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0xAD29AbB318791D579433D831ed122aFeAf29dcfe",
  //   },
  //   COMPOUND: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8",
  //   },
  //   FETCH: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x031b41e504677879370e9DBcF937283A8691Fa7f",
  //   },
  //   MASK: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3",
  //   },
  //   ONT: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0xFd7B3A77848f1C2D67E05E54d78d174a0C850335",
  //   },
  //   SXP: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
  //   },
  //   INJ: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0xa2B726B1145A4773F68593CF171187d8EBe4d495",
  //   },
  //   CHR: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE",
  //   },
  //   XVS: {
  //     coingecko: "https://www.coingecko.com/en/coins/",
  //     bsc: "https://bscscan.com/address/0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63",
  //   },
  //   FRAX: {
  //     coingecko: "https://www.coingecko.com/en/coins/frax",
  //     bsc: "https://bscscan.com/address/0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  //   },
  //   USDC: {
  //     coingecko: "https://www.coingecko.com/en/coins/usd-coin",
  //     bsc: "https://bscscan.com/address/0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  //   },
  //   USDT: {
  //     coingecko: "https://www.coingecko.com/en/coins/tether",
  //     bsc: "https://bscscan.com/address/0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  //   },
  //   BUSD: {
  //     coingecko: "https://www.coingecko.com/en/coins/binance-usd",
  //     bsc: "https://bscscan.com/address/0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  //   },
  // },
  // [POLYGON]: {
  //   UNITY: {
  //     polygon: "https://polygonscan.com/address/0x205876c491A157343F338A1CE0559fD276865Ea1",
  //   },
  //   ULP: {
  //     polygon: "https://polygonscan.com/address/0x6DdB17895eBf0c24Fe41801D153569D9fda93990",
  //   },
  //   MATIC: {
  //     coingecko: "https://www.coingecko.com/en/coins/polygon",
  //     polygon: "https://polygonscan.com/address/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //   },
  //   ETH: {
  //     coingecko: "https://www.coingecko.com/en/coins/ethereum",
  //     polygon: "https://polygonscan.com/address/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  //   },
  //   BTC: {
  //     coingecko: "https://www.coingecko.com/en/coins/bitcoin",
  //     polygon: "https://polygonscan.com/address/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  //   },
  //   CRV: {
  //     coingecko: "https://www.coingecko.com/en/coins/curve-dao-token",
  //     polygon: "https://polygonscan.com/address/0x172370d5Cd63279eFa6d502DAB29171933a610AF",
  //   },
  //   SOL: {
  //     coingecko: "https://www.coingecko.com/en/coins/solana",
  //     polygon: "https://polygonscan.com/address/0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4",
  //   },
  //   renDOGE: {
  //     coingecko: "https://www.coingecko.com/en/coins/rendoge",
  //     polygon: "https://polygonscan.com/address/0xcE829A89d4A55a63418bcC43F00145adef0eDB8E",
  //   },
  //   AVAX: {
  //     coingecko: "https://www.coingecko.com/en/coins/avalanche",
  //     polygon: "https://polygonscan.com/address/0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
  //   },
  //   SAND: {
  //     coingecko: "https://www.coingecko.com/en/coins/the-sandbox",
  //     polygon: "https://polygonscan.com/address/0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
  //   },
  //   MANA: {
  //     coingecko: "https://www.coingecko.com/en/coins/decentraland",
  //     polygon: "https://polygonscan.com/address/0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4",
  //   },
  //   "1INCH": {
  //     coingecko: "https://www.coingecko.com/en/coins/1inch",
  //     polygon: "https://polygonscan.com/address/0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f",
  //   },
  //   APE: {
  //     coingecko: "https://www.coingecko.com/en/coins/apecoin",
  //     polygon: "https://polygonscan.com/address/0xB7b31a6BC18e48888545CE79e83E06003bE70930",
  //   },
  //   SNX: {
  //     coingecko: "https://www.coingecko.com/en/coins/synthetix-network-token",
  //     polygon: "https://polygonscan.com/address/0x50B728D8D964fd00C2d0AAD81718b71311feF68a",
  //   },
  //   AAVE: {
  //     coingecko: "https://www.coingecko.com/en/coins/aave",
  //     polygon: "https://polygonscan.com/address/0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
  //   },
  //   WOO: {
  //     coingecko: "https://www.coingecko.com/en/coins/woo-network",
  //     polygon: "https://polygonscan.com/address/0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603",
  //   },
  //   LINK: {
  //     coingecko: "https://www.coingecko.com/en/coins/chainlink",
  //     polygon: "https://polygonscan.com/address/0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
  //   },
  //   MKR: {
  //     coingecko: "https://www.coingecko.com/en/coins/maker",
  //     polygon: "https://polygonscan.com/address/0x6f7C932e7684666C9fd1d44527765433e01fF61d",
  //   },
  //   SUSHI: {
  //     coingecko: "https://www.coingecko.com/en/coins/sushi",
  //     polygon: "https://polygonscan.com/address/0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
  //   },
  //   CHZ: {
  //     coingecko: "https://www.coingecko.com/en/coins/chiliz",
  //     polygon: "https://polygonscan.com/address/0xf1938Ce12400f9a761084E7A80d37e732a4dA056",
  //   },
  //   OMG: {
  //     coingecko: "https://www.coingecko.com/en/coins/omg-network",
  //     polygon: "https://polygonscan.com/address/0x62414D03084EeB269E18C970a21f45D2967F0170",
  //   },
  //   FXS: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://polygonscan.com/address/0x1a3acf6D19267E2d3e7f898f42803e90C9219062",
  //   },
  //   BAT: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://polygonscan.com/address/0x3Cef98bb43d732E2F285eE605a8158cDE967D219",
  //   },
  //   ZRX: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://polygonscan.com/address/0x5559Edb74751A0edE9DeA4DC23aeE72cCA6bE3D5",
  //   },
  //   OCEAN: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://polygonscan.com/address/0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
  //   },
  //   COMP: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://polygonscan.com/address/0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c",
  //   },
  //   FRAX: {
  //     coingecko: "https://www.coingecko.com/en/coins/frax",
  //     polygon: "https://polygonscan.com/address/0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
  //   },
  //   USDC: {
  //     coingecko: "https://www.coingecko.com/en/coins/usd-coin",
  //     polygon: "https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  //   },
  //   USDT: {
  //     coingecko: "https://www.coingecko.com/en/coins/tether",
  //     polygon: "https://polygonscan.com/address/0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  //   },
  //   DAI: {
  //     coingecko: "https://www.coingecko.com/en/coins/dai",
  //     polygon: "https://polygonscan.com/address/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  //   },
  // },
  // [OPTIMISM]: {
  //   UNITY: {
  //     polygon: "https://optimistic.etherscan.io/address/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
  //   },
  //   ULP: {
  //     polygon: "https://optimistic.etherscan.io/address/0x581f096219C45ac4f433Dee8eB0b699B7b8AE5Ca",
  //   },
  //   ETH: {
  //     coingecko: "https://www.coingecko.com/en/coins/ethereum",
  //     polygon: "https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000006",
  //   },
  //   BTC: {
  //     coingecko: "https://www.coingecko.com/en/coins/bitcoin",
  //     polygon: "https://optimistic.etherscan.io/address/0x68f180fcCe6836688e9084f035309E29Bf0A2095",
  //   },
  //   AAVE: {
  //     coingecko: "https://www.coingecko.com/en/coins/aave",
  //     polygon: "https://optimistic.etherscan.io/address/0x76FB31fb4af56892A25e32cFC43De717950c9278",
  //   },
  //   LINK: {
  //     coingecko: "https://www.coingecko.com/en/coins/chainlink",
  //     polygon: "https://optimistic.etherscan.io/address/0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
  //   },
  //   LIDO: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://optimistic.etherscan.io/address/0xFdb794692724153d1488CcdBE0C56c252596735F",
  //   },
  //   UNI: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://optimistic.etherscan.io/address/0x6fd9d7AD17242c41f7131d257212c54A0e816691",
  //   },
  //   SNX: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://optimistic.etherscan.io/address/0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
  //   },
  //   OP: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000042",
  //   },
  //   BALANCER: {
  //     coingecko: "https://www.coingecko.com/en/coins",
  //     polygon: "https://optimistic.etherscan.io/address/0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921",
  //   },
  //   FRAX: {
  //     coingecko: "https://www.coingecko.com/en/coins/frax",
  //     polygon: "https://optimistic.etherscan.io/address/0x2E3D870790dC77A83DD1d18184Acc7439A53f475",
  //   },
  //   USDC: {
  //     coingecko: "https://www.coingecko.com/en/coins/usd-coin",
  //     polygon: "https://optimistic.etherscan.io/address/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  //   },
  //   USDT: {
  //     coingecko: "https://www.coingecko.com/en/coins/tether",
  //     polygon: "https://optimistic.etherscan.io/address/0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  //   },
  //   DAI: {
  //     coingecko: "https://www.coingecko.com/en/coins/dai",
  //     polygon: "https://optimistic.etherscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  //   },
  // },
  [ARBITRUM]: {
    UNITY: {
      polygon: "https://arbiscan.io/address/0xBe788FeAe3C004EE759149C55Db2D173407633f2",
    },
    ULP: {
      polygon: "https://arbiscan.io/address/0xe0C401e55C993b6bC808Ff2b1f75f29a5DbC5DFD",
    },
    ETH: {
      coingecko: "https://www.coingecko.com/en/coins/ethereum",
      polygon: "https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    },
    BNB: {
      coingecko: "https://www.coingecko.com/en/coins/bnb",
      polygon: "https://arbiscan.io/address/0x20865e63B111B2649ef829EC220536c82C58ad7B",
    },
    BTC: {
      coingecko: "https://www.coingecko.com/en/coins/bitcoin",
      polygon: "https://arbiscan.io/address/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    },
    AAVE: {
      coingecko: "https://www.coingecko.com/en/coins/aave",
      polygon: "https://arbiscan.io/address/0x078f358208685046a11C85e8ad32895DED33A249",
    },
    LINK: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    },
    UNI: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    },
    LIDO: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
    },
    CURVE: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    },
    GMX: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    },
    BALANCER: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
    },
    MAGIC: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x2c852D3334188BE136bFC540EF2bB8C37b590BAD",
    },
    KNC: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB",
    },
    DPX: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    },
    DODO: {
      coingecko: "https://www.coingecko.com/en/coins/chainlink",
      polygon: "https://arbiscan.io/address/0x69Eb4FA4a2fbd498C257C57Ea8b7655a2559A581",
    },
    FRAX: {
      coingecko: "https://www.coingecko.com/en/coins/frax",
      polygon: "https://arbiscan.io/address/0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    },
    USDC: {
      coingecko: "https://www.coingecko.com/en/coins/usd-coin",
      polygon: "https://arbiscan.io/address/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    },
    USDT: {
      coingecko: "https://www.coingecko.com/en/coins/tether",
      polygon: "https://arbiscan.io/address/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    },
    DAI: {
      coingecko: "https://www.coingecko.com/en/coins/dai",
      polygon: "https://arbiscan.io/address/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    },
  },
};

export const ULP_POOL_COLORS = {
  ETH: "#6062a6",
  BTC: "#F7931A",
  WBTC: "#F7931A",
  USDC: "#2775CA",
  "USDC.e": "#2A5ADA",
  USDT: "#67B18A",
  MIM: "#9695F8",
  FRAX: "#000",
  DAI: "#FAC044",
  UNI: "#E9167C",
  MATIC: "#E84142",
  LINK: "#3256D6",
};

export const TOKENS_MAP: { [chainId: number]: { [address: string]: Token } } = {};
export const TOKENS_BY_SYMBOL_MAP: { [chainId: number]: { [symbol: string]: Token } } = {};
export const WRAPPED_TOKENS_MAP: { [chainId: number]: Token } = {};
export const NATIVE_TOKENS_MAP: { [chainId: number]: Token } = {};

const CHAIN_IDS = [ARBITRUM]; //BSC, POLYGON, OPTIMISM,

for (let j = 0; j < CHAIN_IDS.length; j++) {
  const chainId = CHAIN_IDS[j];
  TOKENS_MAP[chainId] = {};
  TOKENS_BY_SYMBOL_MAP[chainId] = {};
  let tokens = TOKENS[chainId];
  if (ADDITIONAL_TOKENS[chainId]) {
    tokens = tokens.concat(ADDITIONAL_TOKENS[chainId]);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    TOKENS_MAP[chainId][token.address] = token;
    TOKENS_BY_SYMBOL_MAP[chainId][token.symbol] = token;
  }
}

for (const chainId of CHAIN_IDS) {
  for (const token of TOKENS[chainId]) {
    if (token.isWrapped) {
      WRAPPED_TOKENS_MAP[chainId] = token;
    } else if (token.isNative) {
      NATIVE_TOKENS_MAP[chainId] = token;
    }
  }
}

export function getWrappedToken(chainId: number) {
  return WRAPPED_TOKENS_MAP[chainId];
}

export function getNativeToken(chainId: number) {
  return NATIVE_TOKENS_MAP[chainId];
}

export function getTokens(chainId: number) {
  return TOKENS[chainId];
}

export function isValidToken(chainId: number, address: string) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }
  return address in TOKENS_MAP[chainId];
}

export function getToken(chainId: number, address: string) {
  if (!TOKENS_MAP[chainId]) {
    throw new Error(`Incorrect chainId ${chainId}`);
  }

  if (!TOKENS_MAP[chainId][address]) {
    throw new Error(`Incorrect address "${address}" for chainId ${chainId}`);
  }
  return TOKENS_MAP[chainId][address];
}

export function getTokenBySymbol(chainId: number, symbol: string) {
  const token = TOKENS_BY_SYMBOL_MAP[chainId][symbol];
  if (!token) {
    throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`);
  }
  return token;
}

export function getWhitelistedTokens(chainId: number) {
  return TOKENS[chainId].filter((token) => token.symbol !== "USDG");
}

export function getVisibleTokens(chainId: number) {
  return getWhitelistedTokens(chainId).filter((token) => !token.isWrapped && !token.isTempHidden);
}
