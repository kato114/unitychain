import React, { useMemo, useCallback } from "react";
import CountUp from "react-countup";
import "./Home.css";

import optimismIcon from "img/ic_trading_optimism.png";
import polygonIcon from "img/ic_trading_polygon.png";
import bscIcon from "img/ic_trading_bsc.png";
import zksyncIcon from "img/ic_trading_zksync.png";
import ftmIcon from "img/ic_trading_ftm.png";
import arbitrumIcon from "img/ic_arbitrum_96.svg";

import homeImg from "img/home.png";
import certikImg from "img/zokyo.svg";

import homeInfoImg from "img/home-info.png";
import levelborderImg from "img/level-border.png";
import levelouterImg from "img/level-outer.png";
import levelinnerImg from "img/level-inner.png";
import levellogoImg from "img/level-logo.png";

import levelzeroImg from "img/level-fast.png";
import levelleverageImg from "img/level-leverage.png";
import levelcustodyImg from "img/level-custody.png";
import levelliquidityImg from "img/level-liquidity.png";
import levelnativeImg from "img/level-network.png";
import levellightningImg from "img/level-optimize.png";

import useSWR from "swr";

import { useVolumeData } from "domain/legacy";
import { USD_DECIMALS, getTotalVolumeSum } from "lib/legacy";

import { useUserStat, useTradersData } from "domain/legacy";

import TokenCard from "components/TokenCard/TokenCard";
import { Trans } from "@lingui/macro";
import { HeaderLink } from "components/Header/HeaderLink";
import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { getServerUrl } from "config/backend";
import { bigNumberify, formatAmount, numberWithCommas } from "lib/numbers";

export default function Home({ showRedirectModal, redirectPopupTimestamp }) {
  // const [bscTotalVolumeSum, bscTotalVolumeDelta] = useVolumeData(BSC);
  // const [polygonTotalVolumeSum, polygonTotalVolumeDelta] = useVolumeData(POLYGON);
  // const [optimismTotalVolumeSum, optimismTotalVolumeDelta] = useVolumeData(OPTIMISM);
  const [arbitrumTotalVolumeSum, arbitrumTotalVolumeDelta] = useVolumeData(ARBITRUM);
  let totalVolumeSum = arbitrumTotalVolumeSum; //bscTotalVolumeSum + polygonTotalVolumeSum + optimismTotalVolumeSum +

  const [totalTradersData, totalTradersLoading] = useTradersData(ARBITRUM);

  // const [openInterest, openInterestDelta] = useMemo(() => {
  //   if (!totalTradersData) {
  //     return [];
  //   }
  //   const total = totalTradersData.data[totalTradersData.data.length - 1]?.openInterest;
  //   const delta = total - totalTradersData.data[totalTradersData.data.length - 2]?.openInterest;
  //   return [total, delta];
  // }, [totalTradersData]);

  // const bscPositionStatsUrl = getServerUrl(BSC, "/position_stats");
  // const { data: bscPositionStats } = useSWR([bscPositionStatsUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // const polygonPositionStatsUrl = getServerUrl(POLYGON, "/position_stats");
  // const { data: polygonPositionStats } = useSWR([polygonPositionStatsUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // const optimismPositionStatsUrl = getServerUrl(OPTIMISM, "/position_stats");
  // const { data: optimismPositionStats } = useSWR([optimismPositionStatsUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  const arbitrumPositionStatsUrl = getServerUrl(ARBITRUM, "/position_stats");
  const { data: arbitrumPositionStats } = useSWR([arbitrumPositionStatsUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });
  // Open Interest

  let openInterest = bigNumberify(0);
  // if (bscPositionStats && bscPositionStats.totalLongPositionSizes && bscPositionStats.totalShortPositionSizes) {
  //   openInterest = openInterest.add(bscPositionStats.totalLongPositionSizes);
  //   openInterest = openInterest.add(bscPositionStats.totalShortPositionSizes);
  // }

  // if (
  //   polygonPositionStats &&
  //   polygonPositionStats.totalLongPositionSizes &&
  //   polygonPositionStats.totalShortPositionSizes
  // ) {
  //   openInterest = openInterest.add(polygonPositionStats.totalLongPositionSizes);
  //   openInterest = openInterest.add(polygonPositionStats.totalShortPositionSizes);
  // }

  // if (
  //   optimismPositionStats &&
  //   optimismPositionStats.totalLongPositionSizes &&
  //   optimismPositionStats.totalShortPositionSizes
  // ) {
  //   openInterest = openInterest.add(optimismPositionStats.totalLongPositionSizes);
  //   openInterest = openInterest.add(optimismPositionStats.totalShortPositionSizes);
  // }

  if (
    arbitrumPositionStats &&
    arbitrumPositionStats.totalLongPositionSizes &&
    arbitrumPositionStats.totalShortPositionSizes
  ) {
    openInterest = openInterest.add(arbitrumPositionStats.totalLongPositionSizes);
    openInterest = openInterest.add(arbitrumPositionStats.totalShortPositionSizes);
  }

  // user stat
  // const bscUserStats = useUserStat(BSC);
  // const polygonUserStats = useUserStat(POLYGON);
  // const optimismUserStats = useUserStat(OPTIMISM);
  const arbitrumUserStats = useUserStat(ARBITRUM);
  let totalUsers = 0;

  // if (bscUserStats && bscUserStats.uniqueCount) {
  //   totalUsers += bscUserStats.uniqueCount;
  // }

  // if (polygonUserStats && polygonUserStats.uniqueCount) {
  //   totalUsers += polygonUserStats.uniqueCount;
  // }

  // if (optimismUserStats && optimismUserStats.uniqueCount) {
  //   totalUsers += optimismUserStats.uniqueCount;
  // }

  if (arbitrumUserStats && arbitrumUserStats.uniqueCount) {
    totalUsers += arbitrumUserStats.uniqueCount;
  }

  const LaunchExchangeButton = () => {
    return (
      <HeaderLink
        className="Home-btn"
        to="/trade"
        redirectPopupTimestamp={redirectPopupTimestamp}
        showRedirectModal={showRedirectModal}
      >
        <Trans>Launch Exchange</Trans>
      </HeaderLink>
    );
  };

  return (
    <div className="Home">
      <div className="Home-top">
        <div className="Home-title-section-container default-container">
          <div className="Home-title-section">
            <div className="Home-title">
              <img src={homeImg} alt="Pretetual Exchange" width="100%" />
            </div>
            <HeaderLink
              className="default-btn"
              to="/trade"
              redirectPopupTimestamp={redirectPopupTimestamp}
              showRedirectModal={showRedirectModal}
              style={{ marginTop: "20px" }}
            >
              <Trans>Launch Exchange</Trans>
            </HeaderLink>
          </div>
        </div>
      </div>
      <div className="Home-latest-info-container">
        <div className="default-container">
          <div className="Home-latest-info-block">
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Trading Volume</Trans>
              </div>
              <div className="Home-latest-info__value">
                $
                <CountUp
                  end={isNaN(totalVolumeSum) ? 0 : totalVolumeSum.toFixed(2)}
                  redraw={true}
                  decimals={2}
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                />
              </div>
            </div>
          </div>
          <div className="Home-latest-info-between"></div>
          <div className="Home-latest-info-block">
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Users</Trans>
              </div>
              <div className="Home-latest-info__value">
                <CountUp
                  end={isNaN(totalUsers) ? 0 : numberWithCommas(totalUsers.toFixed(0))}
                  redraw={true}
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                />
              </div>
            </div>
          </div>
        </div>
        <img src={homeInfoImg} width="60%" />
        <div className="Home-latest-info-block">
          <div className="Home-latest-info-content">
            <div className="Home-latest-info__title">
              <Trans>Open Interest</Trans>
            </div>
            <div className="Home-latest-info__value">
              $
              <CountUp
                end={isNaN(openInterest) ? 0 : formatAmount(openInterest, USD_DECIMALS, 2, false)}
                redraw={true}
                decimals={2}
                enableScrollSpy={true}
                scrollSpyOnce={true}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="Home-level-section">
        <div className="default-container">
          <div className="Home-level-section__content">
            <div className="Home-level-section__content-left">
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levelzeroImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Zero Price Impact</p>
                  <span>
                    $100 or $1,000,000 position, the
                    <br /> price impact will always be 0%
                  </span>
                </div>
              </div>
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levelleverageImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Up to 100x Leverage</p>
                  <span>
                    Unleash full trading power
                    <br /> with up to 100x leverage
                  </span>
                </div>
              </div>
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levelcustodyImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Self-Custody</p>
                  <span>
                    Trade directly via your Web3
                    <br /> wallet Your key, your assets
                  </span>
                </div>
              </div>
            </div>
            <div className="Home-level-img-container">
              <img id="outer-circle" src={levelouterImg} />
              <img id="inner-circle" src={levelinnerImg} />
              <img src={levellogoImg} />
              <img src={levelborderImg} />
            </div>
            <div className="Home-level-section__content-right">
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levelliquidityImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Aggregated Liquidity</p>
                  <span>
                    UnityChain routes positions to suited <br />
                    liquidity sources to support needed sizes.
                  </span>
                </div>
              </div>
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levelnativeImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Multi-Chain Native</p>
                  <span>
                    Trade on any deployed networks
                    <br /> with the same unified liquidity depth.
                  </span>
                </div>
              </div>
              <div className="Home-level-section__content_item">
                <div className="Home-level-section__content_icon">
                  <img src={levellightningImg} alt="LOGO Icon" />
                </div>
                <div className="Home-level-section__content_text">
                  <p>Lightning Fast</p>
                  <span>
                    Experience optimized
                    <br /> order execution speed.
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="Home-level-section__content__mobile">
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levelzeroImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Zero Price Impact</p>
                <span>
                  $100 or $1,000,000 position, the
                  <br /> price impact will always be 0%
                </span>
              </div>
            </div>
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levelleverageImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Up to 100x Leverage</p>
                <span>
                  Unleash full trading power
                  <br /> with up to 100x leverage
                </span>
              </div>
            </div>
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levelcustodyImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Self-Custody</p>
                <span>
                  Trade directly via your Web3
                  <br /> wallet Your key, your assets
                </span>
              </div>
            </div>
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levelliquidityImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Aggregated Liquidity</p>
                <span>
                  UnityChain routes positions to suited <br />
                  liquidity sources to support needed sizes.
                </span>
              </div>
            </div>
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levelnativeImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Multi-Chain Native</p>
                <span>
                  Trade on any deployed networks
                  <br /> with the same unified liquidity depth.
                </span>
              </div>
            </div>
            <div className="Home-level-section__content_item">
              <div className="Home-level-section__content_icon">
                <img src={levellightningImg} alt="LOGO Icon" />
              </div>
              <div className="Home-level-section__content_text">
                <p>Lightning Fast</p>
                <span>
                  Experience optimized
                  <br /> order execution speed.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="Home-cta-section">
        <div className="Home-cta-container default-container">
          <div className="Home-cta-info">
            <div className="Home-cta-info__title">
              <Trans>Start Trading</Trans>
            </div>
            <div className="Home-cta-info__description">
              <Trans>We are continously add new trading networks and markets.</Trans>
            </div>
          </div>
          <div className="Home-cta-options">
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={arbitrumIcon} alt="Polygon Icon" width="20px" />
                <span>Arbitrum Network</span>
              </div>
              <div className="Home-cta-option-action">
                <LaunchExchangeButton />
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={polygonIcon} alt="Polygon Icon" width="20px" />
                <span>Polygon Network</span>
              </div>
              <div className="Home-cta-option-action">
                <span className="Home-btn">Launch Exchange</span>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={bscIcon} alt="Polygon Icon" width="20px" />
                <span>Binance Smart Chain</span>
              </div>
              <div className="Home-cta-option-action">
                <span className="Home-btn">Launch Exchange</span>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={optimismIcon} alt="Polygon Icon" width="20px" />
                <span>Optimism Network</span>
              </div>
              <div className="Home-cta-option-action">
                <span className="Home-btn">Launch Exchange</span>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={zksyncIcon} alt="Polygon Icon" width="20px" />
                <span>zkSync Network</span>
              </div>
              <div className="Home-cta-option-action">
                <span className="Home-btn">Launch Exchange</span>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-title">
                <img src={ftmIcon} alt="Polygon Icon" width="20px" />
                <span>Fantom Network</span>
              </div>
              <div className="Home-cta-option-action">
                <span className="Home-btn">Launch Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="Home-token-card-section">
        <div className="Home-token-card-container default-container">
          <TokenCard showRedirectModal={showRedirectModal} redirectPopupTimestamp={redirectPopupTimestamp} />
        </div>
      </div> */}
      <div className="Home-certik-section">
        <div className="default-container">
          <div className="Home-certik">
            <div className="Home-certik__info">
              <p>Security & Audits</p>
              <span>
                Our smart contracts have been unit tested and have undergone multiple independent audits from Zokyo.
              </span>
            </div>
            <div className="Home-certik__logo">
              <img src={certikImg} alt="Certik Image" width="150px" />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="Home-back-section">
        <div className="default-container">
          <div className="Home-back-content">
            <div>
              <img src={bbscImg} alt="Back Image" />
            </div>
            <div>
              <img src={boptimismImg} alt="Back Image" />
            </div>
            <div>
              <img src={bpolygonImg} alt="Back Image" />
            </div>
            <div>
              <img src={bzksyncImg} alt="Back Image" />
            </div>
            <div>
              <img src={bftmImg} alt="Back Image" />
            </div>
            <div>
              <img src={bsubgraphImg} alt="Back Image" />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
