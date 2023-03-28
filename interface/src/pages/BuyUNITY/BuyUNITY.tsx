import React, { useCallback } from "react";
import { ethers } from "ethers";
// import { Widget } from "@kyberswap/widgets";
import Footer from "components/Footer/Footer";
import "./BuyUNITY.css";
import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";
import Button from "components/Common/Button";
import { ARBITRUM, getChainName, getConstant } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import Card from "components/Common/Card";
import { importImage } from "lib/legacy";
import ExternalLink from "components/ExternalLink/ExternalLink";

import Banxa from "img/ic_banxa.svg";
import Uniswap from "img/ic_uni_bsc.svg";
import QuickSwap from "img/ic_traderjoe.svg";
import Bungee from "img/ic_bungee.png";
import O3 from "img/ic_o3.png";
import Binance from "img/ic_binance.svg";
import ohmBsc from "img/ic_olympus_bsc.svg";
import { CENTRALISED_EXCHANGES, DECENTRALISED_AGGRIGATORS, EXTERNAL_LINKS, TRANSFER_EXCHANGES } from "./constants";

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

export default function BuyUNITY() {
  const { chainId } = useChainId();
  // const isBsc = chainId === BSC;
  // const isPolygon = chainId === POLYGON;
  // const isOptimism = chainId === OPTIMISM;
  // const isArbitrum = chainId === ARBITRUM;
  const { active } = useWeb3React();
  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const externalLinks = EXTERNAL_LINKS[chainId];

  const provider = getWsProvider(active, chainId);

  const onNetworkSelect = useCallback(
    (value) => {
      if (value === chainId) {
        return;
      }
      return switchNetwork(value, active);
    },
    [chainId, active]
  );

  return (
    <div className="BuyUNITYULP default-container page-layout py-100">
      <div className="BuyUNITYULP-container">
        <div className="section-title-block">
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Buy $UNITY on {getChainName(chainId)}</Trans>
            </div>
            <div className="Page-description">
              <Trans>Choose to buy from decentralized or centralized exchanges.</Trans>
              <br />
              {/* <Trans>
                To purchase UNITY on the {isBsc ? "Polygon" : "Bsc"} blockchain, please{" "}
                <span onClick={() => onNetworkSelect(isBsc ? POLYGON : BSC)}>change your network</span>.
              </Trans> */}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* <Widget
            theme={customTheme}
            // tokenList={MY_TOKEN_LIST}
            provider={provider}
            // defaultTokenOut={defaultTokenOut[chainId]}
            // feeSetting={{
            //   feeAmount: 100,
            //   feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
            //   chargeFeeBy: "currency_in",
            //   isInBps: true,
            // }}
          /> */}
        </div>
        {/* <div className="cards-row">
          <DecentralisedExchanges chainId={chainId} externalLinks={externalLinks} />
          <CentralisedExchanges chainId={chainId} externalLinks={externalLinks} />
        </div> 
        
        {isBsc && (
          <div className="section-title-block mt-top">
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy or Transfer BNB to Bsc</Trans>
              </div>
              <div className="Page-description">
                <Trans>Buy BNB directly to Bsc or transfer it there.</Trans>
              </div>
            </div>
          </div>
        )}
        {isPolygon && (
          <div className="section-title-block mt-top">
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy or Transfer MATIC to Polygon</Trans>
              </div>
              <div className="Page-description">
                <Trans>Buy MATIC directly to Polygon or transfer it there.</Trans>
              </div>
            </div>
          </div>
        )}
        {isOptimism && (
          <div className="section-title-block mt-top">
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy or Transfer ETH to Optimism</Trans>
              </div>
              <div className="Page-description">
                <Trans>Buy ETH directly to Optimism or transfer it there.</Trans>
              </div>
            </div>
          </div>
        )}
        {isArbitrum && (
          <div className="section-title-block mt-top">
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy or Transfer ETH to Arbitrum</Trans>
              </div>
              <div className="Page-description">
                <Trans>Buy ETH directly to Arbitrum or transfer it there.</Trans>
              </div>
            </div>
          </div>
        )}

        <div className="cards-row">
          <Card title={t`Buy ${nativeTokenSymbol}`}>
            <div className="App-card-content">
              <div className="BuyUNITYULP-description">
                {isBsc && (
                  <Trans>
                    You can buy BNB directly on <ExternalLink href={externalLinks.networkWebsite}>Bsc</ExternalLink>{" "}
                    using these options:
                  </Trans>
                )}
                {isPolygon && (
                  <Trans>
                    You can buy MATIC directly on{" "}
                    <ExternalLink href={externalLinks.networkWebsite}>Polygon</ExternalLink> using these options:
                  </Trans>
                )}
                {isOptimism && (
                  <Trans>
                    You can buy ETH directly on{" "}
                    <ExternalLink href={externalLinks.networkWebsite}>Optimism</ExternalLink> using these options:
                  </Trans>
                )}
                {isArbitrum && (
                  <Trans>
                    You can buy ETH directly on{" "}
                    <ExternalLink href={externalLinks.networkWebsite}>Arbitrum</ExternalLink> using these options:
                  </Trans>
                )}
              </div>
              <div className="buttons-group">
                <Button href={externalLinks.bungee} imgSrc={Bungee}>
                  Bungee
                </Button>
              </div>
            </div>
          </Card>
          <Card title={t`Transfer ${nativeTokenSymbol}`}>
            <div className="App-card-content">
              {isBsc && (
                <div className="BuyUNITYULP-description">
                  <Trans>You can transfer BNB from other networks to Bsc using any of the below options:</Trans>
                </div>
              )}
              {isPolygon && (
                <div className="BuyUNITYULP-description">
                  <Trans>You can transfer MATIC from other networks to Polygon using any of the below options:</Trans>
                </div>
              )}
              {isOptimism && (
                <div className="BuyUNITYULP-description">
                  <Trans>You can transfer ETH from other networks to Optimism using any of the below options:</Trans>
                </div>
              )}
              {isArbitrum && (
                <div className="BuyUNITYULP-description">
                  <Trans>You can transfer ETH from other networks to Arbitrum using any of the below options:</Trans>
                </div>
              )}
              <div className="buttons-group">
                {TRANSFER_EXCHANGES.filter((e) => e.networks.includes(chainId)).map((exchange) => {
                  const icon = importImage(exchange.icon) || "";
                  return (
                    <Button key={exchange.name} href={exchange.link} imgSrc={icon}>
                      {exchange.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

function DecentralisedExchanges({ chainId, externalLinks }) {
  // const isBsc = chainId === BSC;
  // const isPolygon = chainId === POLYGON;
  // const isOptimism = chainId === OPTIMISM;
  const isArbitrum = chainId === ARBITRUM;
  return (
    <Card title={t`Buy $UNITY from a Decentralized Exchange`}>
      <div className="App-card-content">
        {/* {isBsc && (
          <div className="exchange-info-group">
            <div className="BuyUNITYULP-description">
              <Trans>Buy UNITY from Pancakeswap (make sure to select Bsc):</Trans>
            </div>
            <div className="buttons-group col-1">
              <Button imgSrc={Uniswap} href={externalLinks.buyUnity.uniswap}>
                <Trans>Pancakeswap</Trans>
              </Button>
            </div>
          </div>
        )}
        {isPolygon && (
          <div className="exchange-info-group">
            <div className="BuyUNITYULP-description">
              <Trans>Buy $UNITY from QuickSwap:</Trans>
            </div>
            <div className="buttons-group col-1">
              <Button imgSrc={QuickSwap} href={externalLinks.buyUnity.traderjoe}>
                <Trans>QuickSwap</Trans>
              </Button>
            </div>
          </div>
        )}
        {isOptimism && (
          <div className="exchange-info-group">
            <div className="BuyUNITYULP-description">
              <Trans>Buy $UNITY from Uniswap:</Trans>
            </div>
            <div className="buttons-group col-1">
              <Button imgSrc={Uniswap} href={externalLinks.buyUnity.traderjoe}>
                <Trans>Uniswap</Trans>
              </Button>
            </div>
          </div>
        )} */}
        {isArbitrum && (
          <div className="exchange-info-group">
            <div className="BuyUNITYULP-description">
              <Trans>Buy $UNITY from Uniswap:</Trans>
            </div>
            <div className="buttons-group col-1">
              <Button imgSrc={Uniswap} href={externalLinks.buyUnity.traderjoe}>
                <Trans>Uniswap</Trans>
              </Button>
            </div>
          </div>
        )}
        <div className="exchange-info-group">
          <div className="BuyUNITYULP-description">
            {/* <Trans>Buy $UNITY using Decentralized Exchange Aggregators:</Trans> */}
          </div>
          <div className="buttons-group">
            {/* {DECENTRALISED_AGGRIGATORS.filter((e) => e.networks.includes(chainId)).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              const link = exchange.links ? exchange.links[chainId] : exchange.link;
              return (
                <Button key={exchange.name} imgSrc={icon} href={link}>
                  <Trans>{exchange.name}</Trans>
                </Button>
              );
            })} */}
          </div>
        </div>
        {/* <div className="exchange-info-group">
          <div className="BuyUNITYULP-description">
            <Trans>Buy $UNITY using any token from any network:</Trans>
          </div>
          <div className="buttons-group">
            <Button href={externalLinks.bungee} imgSrc={Bungee}>
              Bungee
            </Button>
            <Button href={externalLinks.o3} imgSrc={O3}>
              O3
            </Button>
          </div>
        </div> */}
        {/* {isBsc && (
          <div className="exchange-info-group">
            <div className="BuyUNITYULP-description">
              <Trans>UNITY bonds can be bought on Olympus Pro with a discount and a small vesting period:</Trans>
            </div>
            <div className="buttons-group col-1">
              <Button imgSrc={ohmBsc} href="https://pro.olympusdao.finance/#/partners/UNITY">
                Olympus Pro
              </Button>
            </div>
          </div>
        )} */}
      </div>
    </Card>
  );
}

function CentralisedExchanges({ chainId, externalLinks }) {
  return (
    <Card title={t`Buy $UNITY from centralized services`}>
      <div className="App-card-content">
        <div className="exchange-info-group">
          <div className="BuyUNITYULP-description">{/* <Trans>Buy $UNITY from centralized exchanges:</Trans> */}</div>
          <div className="buttons-group">
            {/* {CENTRALISED_EXCHANGES.filter((e) => e.networks.includes(chainId)).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              return (
                <Button key={exchange.name} href={exchange.link} imgSrc={icon}>
                  {exchange.name}
                </Button>
              );
            })} */}
          </div>
        </div>

        <div className="exchange-info-group">
          <div className="BuyUNITYULP-description">{/* <Trans>Buy $UNITY using FIAT gateways:</Trans> */}</div>
          <div className="buttons-group col-2">
            {/* <Button href="https://www.binancecnt.com/en/buy-sell-crypto" imgSrc={Binance}>
              Binance Connect
            </Button>
            <Button href={externalLinks.buyUnity.banxa} imgSrc={Banxa}>
              Banxa
            </Button> */}
          </div>
        </div>
      </div>
    </Card>
  );
}
