import React from "react";
import { ethers } from "ethers";
import { Trans } from "@lingui/macro";
import Footer from "components/Footer/Footer";
// import { Widget } from "@kyberswap/widgets";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import { useWeb3React } from "@web3-react/core";
import { getNativeToken, getToken, getTokens, getWhitelistedTokens, getWrappedToken } from "config/tokens";
import { useChainId } from "lib/chains";
import { ARBITRUM, getChainName, IS_NETWORK_DISABLED } from "config/chains"; //BSC, POLYGON, OPTIMISM,

export declare const Theme: {
  text: string;
  subText: string;
  primary: string;
  dialog: string;
  secondary: string;
  interactive: string;
  stroke: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  fontFamily: string;
  borderRadius: string;
  buttonRadius: string;
  boxShadow: string;
};

const customTheme: typeof Theme = {
  primary: "#1C1C1C",
  secondary: "#0F0F0F",
  dialog: "#313131",
  borderRadius: "0px",
  buttonRadius: "24px",
  stroke: "#505050",
  interactive: "#292929",
  accent: "#28E0B9",
  success: "189470",
  warning: "FF9901",
  error: "FF537B",
  text: "#FFFFFF",
  subText: "A9A9A9",
  fontFamily: "Work Sans",
  boxShadow: "#FFFFFF",
};

const MY_TOKEN_LIST = [
  {
    name: "KNC",
    address: "0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C",
    symbol: "KNC",
    decimals: 18,
    chainId: 1,
    logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/9444.png",
  },
  {
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  },
  {
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
];

// const bscWsProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");
// const maticWsProvider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
// const optimismWsProvider = new ethers.providers.JsonRpcProvider("https://optimistic.etherscan.io/");
const arbitrumWsProvider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

function getWsProvider(active, chainId) {
  if (!active) {
    return;
  }
  // if (chainId === BSC) {
  //   return bscWsProvider;
  // }

  // if (chainId === POLYGON) {
  //   return maticWsProvider;
  // }

  // if (chainId === OPTIMISM) {
  //   return optimismWsProvider;
  // }

  if (chainId === ARBITRUM) {
    return arbitrumWsProvider;
  }
}

export default function BuyUNITYULP() {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();
  const provider = getWsProvider(active, chainId);

  return (
    <SEO title={getPageTitle("Bridge")}>
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        {/* <Widget
          theme={customTheme}
          tokenList={MY_TOKEN_LIST}
          provider={provider}
          defaultTokenOut={defaultTokenOut[chainId]}
          feeSetting={{
            feeAmount: 100,
            feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
            chargeFeeBy: "currency_in",
            isInBps: true,
          }}
        /> */}
      </div>
      <Footer />
    </SEO>
  );
}
