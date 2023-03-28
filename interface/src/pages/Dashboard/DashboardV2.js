import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";
import useSWR from "swr";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import TooltipComponent from "components/Tooltip/Tooltip";
import { USD_DECIMALS } from "lib/legacy";

import hexToRgba from "hex-to-rgba";
import { ethers } from "ethers";

import {
  UNITY_DECIMALS,
  ULP_DECIMALS,
  BASIS_POINTS_DIVISOR,
  DEFAULT_MAX_USDG_AMOUNT,
  getPageTitle,
  importImage,
  arrayURLFetcher,
} from "lib/legacy";
import {
  useTotalUnityInLiquidity,
  useUnityPrice,
  useTotalUnityStaked,
  useTotalUnitySupply,
  useTradeVolumeHistory,
  usePositionStates,
  useTotalVolume,
  useFeesData,
  useVolumeData,
  formatNumber,
} from "domain/legacy";
import useFeesSummary from "domain/useFeesSummary";

import { getContract } from "config/contracts";

import VaultV2 from "abis/VaultV2.json";
import ReaderV2 from "abis/ReaderV2.json";
import UlpManager from "abis/UlpManager.json";
import Footer from "components/Footer/Footer";

import "./DashboardV2.css";

import unity40Icon from "img/ic_unity_40.png";
import ulp40Icon from "img/ic_ulp_40.png";
import polygon16Icon from "img/ic_polygon_16.svg";
import polygon24Icon from "img/ic_polygon_24.svg";
import bsc16Icon from "img/ic_bsc_16.svg";
import bsc24Icon from "img/ic_bsc_24.svg";
import optimism16Icon from "img/ic_optimism_16.svg";
import optimism24Icon from "img/ic_optimism_24.svg";
import arbitrum16Icon from "img/ic_arbitrum_16.svg";
import arbitrum24Icon from "img/ic_arbitrum_24.svg";

import AssetDropdown from "./AssetDropdown";
import ExternalLink from "components/ExternalLink/ExternalLink";
import SEO from "components/Common/SEO";
import StatsTooltip from "components/StatsTooltip/StatsTooltip";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import { ARBITRUM, getChainName } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { getServerUrl } from "config/backend";
import { contractFetcher } from "lib/contracts";
import { useInfoTokens } from "domain/tokens";
import { getTokenBySymbol, getWhitelistedTokens, ULP_POOL_COLORS } from "config/tokens";
import { bigNumberify, expandDecimals, formatAmount, formatKeyAmount, numberWithCommas } from "lib/numbers";
import { useChainId } from "lib/chains";
import { formatDate } from "lib/dates";
const ACTIVE_CHAIN_IDS = [ARBITRUM]; //BSC, POLYGON, OPTIMISM,

const { AddressZero } = ethers.constants;

function getVolumeInfo(hourlyVolumes) {
  if (!hourlyVolumes || hourlyVolumes.length === 0) {
    return {};
  }
  const dailyVolumes = hourlyVolumes.map((hourlyVolume) => {
    const secondsPerHour = 60 * 60;
    const minTime = parseInt(Date.now() / 1000 / secondsPerHour) * secondsPerHour - 24 * secondsPerHour;
    const info = {};
    let totalVolume = bigNumberify(0);
    for (let i = 0; i < hourlyVolume.length; i++) {
      const item = hourlyVolume[i].data;
      if (parseInt(item.timestamp) < minTime) {
        break;
      }

      if (!info[item.token]) {
        info[item.token] = bigNumberify(0);
      }

      info[item.token] = info[item.token].add(item.volume);
      totalVolume = totalVolume.add(item.volume);
    }
    info.totalVolume = totalVolume;
    return info;
  });
  return dailyVolumes.reduce(
    (acc, cv, index) => {
      acc.totalVolume = acc.totalVolume.add(cv.totalVolume);
      acc[ACTIVE_CHAIN_IDS[index]] = cv;
      return acc;
    },
    { totalVolume: bigNumberify(0) }
  );
}

function getPositionStats(positionStats) {
  if (!positionStats || positionStats.length === 0) {
    return null;
  }
  return positionStats.reduce(
    (acc, cv, i) => {
      acc.totalLongPositionSizes = acc.totalLongPositionSizes.add(cv.totalLongPositionSizes);
      acc.totalShortPositionSizes = acc.totalShortPositionSizes.add(cv.totalShortPositionSizes);
      acc[ACTIVE_CHAIN_IDS[i]] = cv;
      return acc;
    },
    {
      totalLongPositionSizes: bigNumberify(0),
      totalShortPositionSizes: bigNumberify(0),
    }
  );
}

function getCurrentFeesUsd(tokenAddresses, fees, infoTokens) {
  if (!fees || !infoTokens) {
    return bigNumberify(0);
  }

  let currentFeesUsd = bigNumberify(0);
  for (let i = 0; i < tokenAddresses.length; i++) {
    const tokenAddress = tokenAddresses[i];
    const tokenInfo = infoTokens[tokenAddress];
    if (!tokenInfo || !tokenInfo.contractMinPrice) {
      continue;
    }

    const feeUsd = fees[i].mul(tokenInfo.contractMinPrice).div(expandDecimals(1, tokenInfo.decimals));
    currentFeesUsd = currentFeesUsd.add(feeUsd);
  }
  return currentFeesUsd;
}

export default function DashboardV2() {
  const { active, library } = useWeb3React();
  const { chainId } = useChainId();
  // const totalVolume = useTotalVolume();
  const [totalVolume, totalVolumeDelta] = useVolumeData(chainId);

  const chainName = getChainName(chainId);
  // const { data: positionStats } = useSWR(
  //   ACTIVE_CHAIN_IDS.map((chainId) => getServerUrl(chainId, "/position_stats")),
  //   {
  //     fetcher: arrayURLFetcher,
  //   }
  // );
  const positionStats = usePositionStates(chainId);

  // const { data: hourlyVolumes } = useSWR(
  //   ACTIVE_CHAIN_IDS.map((chainId) => getServerUrl(chainId, "/hourly_volume")),
  //   {
  //     fetcher: arrayURLFetcher,
  //   }
  // );

  // const hourlyVolumes = useTradeVolumeHistory(chainId);
  // const dailyVolume = useVolumeData({from: parseInt(Date.now() / 1000) - 86400, to: parseInt(Date.now() / 1000) });

  let { total: totalUnitySupply } = useTotalUnitySupply(chainId);

  // const currentVolumeInfo = getVolumeInfo(hourlyVolumes);

  // const positionStatsInfo = getPositionStats(positionStats);
  const positionStatsInfo = positionStats;

  function getWhitelistedTokenAddresses(chainId) {
    const whitelistedTokens = getWhitelistedTokens(chainId);
    return whitelistedTokens.map((token) => token.address);
  }

  const whitelistedTokens = getWhitelistedTokens(chainId);

  const tokenList = whitelistedTokens.filter((t) => !t.isWrapped);
  const visibleTokens = tokenList.filter((t) => !t.isTempHidden);

  const readerAddress = getContract(chainId, "Reader");
  const vaultAddress = getContract(chainId, "Vault");
  const ulpManagerAddress = getContract(chainId, "UlpManager");

  const unityAddress = getContract(chainId, "UNITY");
  const ulpAddress = getContract(chainId, "ULP");
  const usdgAddress = getContract(chainId, "USDG");

  const tokensForSupplyQuery = [unityAddress, ulpAddress, usdgAddress];

  const { data: aums } = useSWR([`Dashboard:getAums:${active}`, chainId, ulpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, UlpManager),
  });

  const { data: totalSupplies } = useSWR(
    [`Dashboard:totalSupplies:${active}`, chainId, readerAddress, "getTokenBalancesWithSupplies", AddressZero],
    {
      fetcher: contractFetcher(library, ReaderV2, [tokensForSupplyQuery]),
    }
  );

  const { data: totalTokenWeights } = useSWR(
    [`UlpSwap:totalTokenWeights:${active}`, chainId, vaultAddress, "totalTokenWeights"],
    {
      fetcher: contractFetcher(library, VaultV2),
    }
  );

  const { infoTokens } = useInfoTokens(library, chainId, active, undefined, undefined);

  console.log("kato infoTokens", infoTokens);

  // const { infoTokens: infoTokensBsc } = useInfoTokens(null, BSC, active, undefined, undefined);
  // const { infoTokens: infoTokensMatic } = useInfoTokens(null, POLYGON, active, undefined, undefined);
  // const { infoTokens: infoTokensOptimism } = useInfoTokens(null, OPTIMISM, active, undefined, undefined);
  const { infoTokens: infoTokensArbitrum } = useInfoTokens(null, ARBITRUM, active, undefined, undefined);
  const { data: currentFees } = useSWR(
    // infoTokensBsc[AddressZero].contractMinPrice &&
    //   infoTokensMatic[AddressZero].contractMinPrice &&
    //   infoTokensOptimism[AddressZero].contractMinPrice &&
    infoTokensArbitrum[AddressZero].contractMinPrice ? "Dashboard:currentFees" : null,
    {
      fetcher: () => {
        return Promise.all(
          ACTIVE_CHAIN_IDS.map((chainId) =>
            contractFetcher(null, ReaderV2, [getWhitelistedTokenAddresses(chainId)])(
              `Dashboard:fees:${chainId}`,
              chainId,
              getContract(chainId, "Reader"),
              "getFees",
              getContract(chainId, "Vault")
            )
          )
        ).then((fees) => {
          return fees.reduce(
            (acc, cv, i) => {
              const feeUSD = getCurrentFeesUsd(
                getWhitelistedTokenAddresses(ACTIVE_CHAIN_IDS[i]),
                cv,
                // ACTIVE_CHAIN_IDS[i] === BSC
                //   ? infoTokensBsc
                //   : ACTIVE_CHAIN_IDS[i] === POLYGON
                //   ? infoTokensMatic
                //   : ACTIVE_CHAIN_IDS[i] === OPTIMISM
                //   ? infoTokensOptimism
                //   :
                infoTokensArbitrum
              );
              acc[ACTIVE_CHAIN_IDS[i]] = feeUSD;
              acc.total = acc.total.add(feeUSD);
              return acc;
            },
            { total: bigNumberify(0) }
          );
        });
      },
    }
  );

  const { data: feesSummaryByChain } = useFeesSummary();
  const feesSummary = feesSummaryByChain[chainId];

  const eth = infoTokens[getTokenBySymbol(chainId, "ETH").address];
  // const shouldIncludeCurrrentFees =
  //   feesSummaryByChain[chainId].lastUpdatedAt &&
  //   parseInt(Date.now() / 1000) - feesSummaryByChain[chainId].lastUpdatedAt > 60 * 60;

  // const totalFees = ACTIVE_CHAIN_IDS.map((chainId) => {
  //   if (shouldIncludeCurrrentFees && currentFees && currentFees[chainId]) {
  //     return currentFees[chainId].div(expandDecimals(1, USD_DECIMALS)).add(feesSummaryByChain[chainId].totalFees || 0);
  //   }

  //   return feesSummaryByChain[chainId].totalFees || 0;
  // })
  //   .map((v) => Math.round(v))
  //   .reduce(
  //     (acc, cv, i) => {
  //       acc[ACTIVE_CHAIN_IDS[i]] = cv;
  //       acc.total = acc.total + cv;
  //       return acc;
  //     },
  //     { total: 0 }
  //   );
  const [totalFees, totalFeesDelta] = useFeesData(chainId);

  const { unityPrice, unityPriceFromArbitrum } = useUnityPrice(
    //unityPriceFromBsc, unityPriceFromPolygon, unityPriceFromOptimism,
    chainId,
    {
      // bsc: chainId === BSC ? library : undefined,
      // optimism: chainId === OPTIMISM ? library : undefined,
      arbitrum: chainId === ARBITRUM ? library : undefined,
    },
    active
  );

  let { total: totalUnityInLiquidity } = useTotalUnityInLiquidity(chainId, active);

  let {
    // matic: maticStakedUnity,
    // bsc: bscStakedUnity,
    // optimism: optimismStakedUnity,
    arbitrum: arbitrumStakedUnity,
    total: totalStakedUnity,
  } = useTotalUnityStaked();

  let unityMarketCap;
  if (unityPrice && totalUnitySupply) {
    unityMarketCap = unityPrice.mul(totalUnitySupply).div(expandDecimals(1, UNITY_DECIMALS));
  }

  let stakedUnitySupplyUsd;
  if (unityPrice && totalStakedUnity) {
    stakedUnitySupplyUsd = totalStakedUnity.mul(unityPrice).div(expandDecimals(1, UNITY_DECIMALS));
  }

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  let ulpPrice;
  let ulpSupply;
  let ulpMarketCap;
  if (aum && totalSupplies && totalSupplies[3]) {
    ulpSupply = totalSupplies[3];
    ulpPrice =
      aum && aum.gt(0) && ulpSupply.gt(0)
        ? aum.mul(expandDecimals(1, ULP_DECIMALS)).div(ulpSupply)
        : expandDecimals(1, USD_DECIMALS);
    ulpMarketCap = ulpPrice.mul(ulpSupply).div(expandDecimals(1, ULP_DECIMALS));
  }

  let tvl;
  if (ulpMarketCap && unityPrice && totalStakedUnity) {
    tvl = ulpMarketCap.add(unityPrice.mul(totalStakedUnity).div(expandDecimals(1, UNITY_DECIMALS)));
  }

  const ethFloorPriceFund = expandDecimals(350, 18);
  const ulpFloorPriceFund = expandDecimals(660, 18);
  const usdcFloorPriceFund = expandDecimals(784 + 200, 30);

  let totalFloorPriceFundUsd;

  if (eth && eth.contractMinPrice && ulpPrice) {
    const ethFloorPriceFundUsd = ethFloorPriceFund.mul(eth.contractMinPrice).div(expandDecimals(1, eth.decimals));
    const ulpFloorPriceFundUsd = ulpFloorPriceFund.mul(ulpPrice).div(expandDecimals(1, 18));

    totalFloorPriceFundUsd = ethFloorPriceFundUsd.add(ulpFloorPriceFundUsd).add(usdcFloorPriceFund);
  }

  let adjustedUsdgSupply = bigNumberify(0);

  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i];
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo && tokenInfo.usdgAmount) {
      adjustedUsdgSupply = adjustedUsdgSupply.add(tokenInfo.usdgAmount);
    }
  }

  const getWeightText = (tokenInfo) => {
    if (
      !tokenInfo.weight ||
      !tokenInfo.usdgAmount ||
      !adjustedUsdgSupply ||
      adjustedUsdgSupply.eq(0) ||
      !totalTokenWeights
    ) {
      return "...";
    }

    const currentWeightBps = tokenInfo.usdgAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdgSupply);
    // use add(1).div(10).mul(10) to round numbers up
    const targetWeightBps = tokenInfo.weight.mul(BASIS_POINTS_DIVISOR).div(totalTokenWeights).add(1).div(10).mul(10);

    const weightText = `${formatAmount(currentWeightBps, 2, 2, false)}% / ${formatAmount(
      targetWeightBps,
      2,
      2,
      false
    )}%`;

    return (
      <TooltipComponent
        handle={weightText}
        position="right-bottom"
        renderContent={() => {
          return (
            <>
              <StatsTooltipRow
                label={t`Current Weight`}
                value={`${formatAmount(currentWeightBps, 2, 2, false)}%`}
                showDollar={false}
              />
              <StatsTooltipRow
                label={t`Target Weight`}
                value={`${formatAmount(targetWeightBps, 2, 2, false)}%`}
                showDollar={false}
              />
              <br />
              {currentWeightBps.lt(targetWeightBps) && (
                <div className="text-white">
                  <Trans>
                    {tokenInfo.symbol} is below its target weight.
                    <br />
                    <br />
                    Get lower fees to{" "}
                    <Link to="/buy_ulp" target="_blank" rel="noopener noreferrer">
                      buy $ULP
                    </Link>{" "}
                    with {tokenInfo.symbol},&nbsp; and to{" "}
                    <Link to="/trade" target="_blank" rel="noopener noreferrer">
                      swap
                    </Link>{" "}
                    {tokenInfo.symbol} for other tokens.
                  </Trans>
                </div>
              )}
              {currentWeightBps.gt(targetWeightBps) && (
                <div className="text-white">
                  <Trans>
                    {tokenInfo.symbol} is above its target weight.
                    <br />
                    <br />
                    Get lower fees to{" "}
                    <Link to="/trade" target="_blank" rel="noopener noreferrer">
                      swap
                    </Link>{" "}
                    tokens for {tokenInfo.symbol}.
                  </Trans>
                </div>
              )}
              <br />
              <div>
                <ExternalLink href="https://docs.utrade.exchange/">
                  <Trans>More Info</Trans>
                </ExternalLink>
              </div>
            </>
          );
        }}
      />
    );
  };

  let stakedPercent = 0;

  if (totalUnitySupply && !totalUnitySupply?.isZero() && !totalStakedUnity?.isZero()) {
    stakedPercent = totalStakedUnity?.mul(100).div(totalUnitySupply).toNumber();
  }

  let liquidityPercent = 0;

  if (totalUnitySupply && !totalUnitySupply?.isZero() && totalUnityInLiquidity) {
    liquidityPercent = totalUnityInLiquidity.mul(100).div(totalUnitySupply).toNumber();
  }

  let notStakedPercent = 100 - stakedPercent - liquidityPercent;

  let unityDistributionData = [
    {
      name: t`staked`,
      value: stakedPercent,
      color: "#4353fa",
    },
    {
      name: t`in liquidity`,
      value: liquidityPercent,
      color: "#0598fa",
    },
    {
      name: t`not staked`,
      value: notStakedPercent,
      color: "#5c0af5",
    },
  ];

  const totalStatsStartDate = t` 1/1 2023`;

  let stableUlp = 0;
  let totalUlp = 0;

  let ulpPool = tokenList.map((token) => {
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo.usdgAmount && adjustedUsdgSupply && adjustedUsdgSupply.gt(0)) {
      const currentWeightBps = tokenInfo.usdgAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdgSupply);
      if (tokenInfo.isStable) {
        stableUlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      }
      totalUlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      return {
        fullname: token.name,
        name: token.symbol,
        value: parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`),
      };
    }
    return null;
  });

  let stablePercentage = totalUlp > 0 ? ((stableUlp * 100) / totalUlp).toFixed(2) : "0.0";

  ulpPool = ulpPool.filter(function (element) {
    return element !== null;
  });

  ulpPool = ulpPool.sort(function (a, b) {
    if (a.value < b.value) return 1;
    else return -1;
  });

  unityDistributionData = unityDistributionData.sort(function (a, b) {
    if (a.value < b.value) return 1;
    else return -1;
  });

  const [unityActiveIndex, setUNITYActiveIndex] = useState(null);

  const onUNITYDistributionChartEnter = (_, index) => {
    setUNITYActiveIndex(index);
  };

  const onUNITYDistributionChartLeave = (_, index) => {
    setUNITYActiveIndex(null);
  };

  const [ulpActiveIndex, setULPActiveIndex] = useState(null);

  const onULPPoolChartEnter = (_, index) => {
    setULPActiveIndex(index);
  };

  const onULPPoolChartLeave = (_, index) => {
    setULPActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="stats-label">
          <div className="stats-label-color" style={{ backgroundColor: payload[0].color }}></div>
          {payload[0].value}% {payload[0].name}
        </div>
      );
    }

    return null;
  };

  return (
    <SEO title={getPageTitle("Dashboard")}>
      <div className="DashboardV2">
        <div className="default-container">
          <div className="DashboardV2-content">
            <div className="App-card">
              <div className="App-card-title">
                <Trans>Statistics Overview</Trans>
                {/* {chainId === POLYGON && <img src={polygon24Icon} alt="polygon24Icon" width="15px" />}
                {chainId === BSC && <img src={bsc24Icon} alt="bsc24Icon" width="15px" />}
                {chainId === OPTIMISM && <img src={optimism24Icon} alt="optimism24Icon" width="15px" />}
                {chainId === ARBITRUM && <img src={arbitrum24Icon} alt="arbitrum24Icon" width="15px" />} */}
              </div>
              <div className="App-card-content">
                <div className="App-card-row">
                  <div className="label">
                    <Trans>AUM</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      handle={`$${formatAmount(tvl, USD_DECIMALS, 0, true)}`}
                      position="right-bottom"
                      renderContent={() => (
                        <span>{t`Assets Under Management: $UNITY staked (All chains) + $ULP pool (${chainName})`}</span>
                        // <div>{t`Assets Under Management: $UNITY staked (All chains) + $ULP pool (${chainName})`}</div>
                      )}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>$ULP Pool</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      handle={`$${formatAmount(aum, USD_DECIMALS, 0, true)}`}
                      position="right-bottom"
                      renderContent={() => <span>{t`Total value of tokens in $ULP pool (${chainName})`}</span>}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>24h Volume</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      // handle={`$${formatAmount(currentVolumeInfo?.[chainId]?.totalVolume, 18, 0, true)}`}
                      handle={
                        totalVolumeDelta
                          ? `${formatNumber(totalVolumeDelta, { currency: true, compact: false })}`
                          : `$0`
                      }
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Volume`}
                          // bscValue={currentVolumeInfo?.[BSC].totalVolume}
                          bscValue={bigNumberify(0)}
                          // maticValue={currentVolumeInfo?.[POLYGON].totalVolume}
                          maticValue={
                            totalVolumeDelta ? formatNumber(totalVolumeDelta, { currency: true, compact: false }) : `$0`
                          }
                          total={
                            totalVolumeDelta ? formatNumber(totalVolumeDelta, { currency: true, compact: false }) : `$0`
                          }
                          isFloatNum={true}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Long Pos.</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      handle={`$${formatAmount(
                        // positionStatsInfo?.[chainId]?.totalLongPositionSizes,
                        positionStatsInfo?.totalLongPositionSizes,
                        18,
                        0,
                        true
                      )}`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Long Positions`}
                          // bscValue={positionStatsInfo?.[BSC].totalLongPositionSizes}
                          maticValue={positionStatsInfo?.totalLongPositionSizes}
                          total={positionStatsInfo?.totalLongPositionSizes}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Short Pos.</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      handle={`$${formatAmount(
                        // positionStatsInfo?.[chainId]?.totalShortPositionSizes,
                        positionStatsInfo?.totalShortPositionSizes,
                        18,
                        0,
                        true
                      )}`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Short Positions`}
                          // bscValue={positionStatsInfo?.[BSC].totalShortPositionSizes}
                          maticValue={positionStatsInfo?.totalShortPositionSizes}
                          total={positionStatsInfo?.totalShortPositionSizes}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Fees since</Trans> 11/12
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      handle={`$${formatAmount(0, 2, true)}`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Fees`}
                          // bscValue={currentFees?.[BSC]}
                          // maticValue={currentFees?.[POLYGON]}
                          // optimismValue={currentFees?.[OPTIMISM]}
                          arbitrumValue={currentFees?.[ARBITRUM]}
                          total={currentFees?.total}
                        />
                      )}
                    />
                  </div>
                </div>
                {feesSummary?.lastUpdatedAt ? (
                  <div className="App-card-row">
                    <div className="label">
                      <Trans>Fees since</Trans> {formatDate(feesSummary?.lastUpdatedAt)}
                    </div>
                    <div>
                      <TooltipComponent
                        position="right-bottom"
                        className="nowrap"
                        handle={`$${formatAmount(currentFees?.[chainId], USD_DECIMALS, 2, true)}`}
                        renderContent={() => (
                          <StatsTooltip
                            title={t`Fees`}
                            // bscValue={currentFees?.[BSC]}
                            // maticValue={currentFees?.[POLYGON]}
                            // optimismValue={currentFees?.[OPTIMISM]}
                            arbitrumValue={currentFees?.[ARBITRUM]}
                            total={currentFees?.total}
                          />
                        )}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Fees</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      // handle={`$${numberWithCommas(totalFees?.[chainId])}`}
                      handle={totalFees ? `${formatNumber(totalFees, { currency: true, compact: false })}` : `$0`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Total Fees`}
                          // bscValue={totalFees?.[BSC]}
                          // maticValue={totalFees?.[POLYGON]}
                          maticValue={totalFees ? formatNumber(totalFees, { currency: true, compact: false }) : `$0`}
                          // total={totalFees?.total}
                          total={totalFees ? formatNumber(totalFees, { currency: true, compact: false }) : `$0`}
                          decimalsForConversion={0}
                          isFloatNum={true}
                        />
                      )}
                      // renderContent={()=>{}}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Volume</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      // handle={`$${formatAmount(totalVolume?.[chainId], USD_DECIMALS, 0, true)}`}
                      handle={totalVolume ? `${formatNumber(totalVolume, { currency: true, compact: false })}` : `$0`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Total Volume`}
                          // bscValue={totalVolume?.[BSC]}
                          // maticValue={totalVolume?.[POLYGON]}
                          maticValue={
                            totalVolume ? formatNumber(totalVolume, { currency: true, compact: false }) : `$0`
                          }
                          // total={totalVolume?.total}
                          total={totalVolume ? formatNumber(totalVolume, { currency: true, compact: false }) : `$0`}
                          isFloatNum={true}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* <div className="App-card-row">
                  <div className="label">
                    <Trans>Floor Price Fund</Trans>
                  </div>
                  <div>${formatAmount(totalFloorPriceFundUsd, 30, 0, true)}</div>
                </div> */}
              </div>
            </div>
            <div className="App-card">
              <div className="App-card-title">
                <div className="App-card-title-mark-title">$UNITY</div>
                <AssetDropdown assetSymbol="UNITY" />
              </div>
              <div className="App-card-content">
                <div className="App-card-row" style={{ padding: "5px 0px", display: "flex", alignItems: "center" }}>
                  <img src={unity40Icon} alt="$UNITY Token Icon" width="30px" />
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Price</Trans>
                  </div>
                  <div>
                    {!unityPrice && "..."}
                    {unityPrice && (
                      <TooltipComponent
                        position="right-bottom"
                        className="nowrap"
                        handle={"$" + formatAmount(unityPrice, USD_DECIMALS, 2, true)}
                        renderContent={() => (
                          <>
                            {/* <StatsTooltipRow
                              label={t`Price on Bsc`}
                              value={formatAmount(unityPriceFromBsc, USD_DECIMALS, 2, true)}
                              showDollar={true}
                            />
                            <StatsTooltipRow
                              label={t`Price on Polygon`}
                              value={formatAmount(unityPriceFromPolygon, USD_DECIMALS, 2, true)}
                              showDollar={true}
                            />
                            <StatsTooltipRow
                              label={t`Price on Optimism`}
                              value={formatAmount(unityPriceFromOptimism, USD_DECIMALS, 2, true)}
                              showDollar={true}
                            /> */}
                            <StatsTooltipRow
                              label={t`Price on Arbitrum`}
                              value={formatAmount(unityPriceFromArbitrum, USD_DECIMALS, 2, true)}
                              showDollar={true}
                            />
                          </>
                        )}
                      />
                    )}
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Supply</Trans>
                  </div>
                  <div>{formatAmount(totalUnitySupply, UNITY_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Staked</Trans>
                  </div>
                  <div>
                    <TooltipComponent
                      position="right-bottom"
                      className="nowrap"
                      handle={`$${formatAmount(stakedUnitySupplyUsd, USD_DECIMALS, 0, true)}`}
                      renderContent={() => (
                        <StatsTooltip
                          title={t`Staked`}
                          // bscValue={bscStakedUnity}
                          // maticValue={maticStakedUnity}
                          // optimismValue={optimismStakedUnity}
                          arbitrumValue={arbitrumStakedUnity}
                          total={totalStakedUnity}
                          decimalsForConversion={UNITY_DECIMALS}
                          showDollar={false}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Market Cap</Trans>
                  </div>
                  <div>${formatAmount(unityMarketCap, USD_DECIMALS, 0, true)}</div>
                </div>
              </div>
            </div>
            <div className="App-card">
              <div className="App-card-title">
                <div className="App-card-title-mark-title">$ULP</div>
                <AssetDropdown assetSymbol="ULP" />
              </div>
              <div className="App-card-content">
                <div className="App-card-row" style={{ padding: "5px 0px", display: "flex", alignItems: "center" }}>
                  <img src={ulp40Icon} alt="ulp40Icon" width="30px" />
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Price</Trans>
                  </div>
                  <div>${formatAmount(ulpPrice, USD_DECIMALS, 3, true)}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Supply</Trans>
                  </div>
                  <div>{formatAmount(ulpSupply, ULP_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Staked</Trans>
                  </div>
                  <div>${formatAmount(ulpMarketCap, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Market Cap</Trans>
                  </div>
                  <div>${formatAmount(ulpMarketCap, USD_DECIMALS, 0, true)}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Stablecoin %</Trans>
                  </div>
                  <div>{stablePercentage}%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="token-table-wrapper">
            <table className="token-table">
              <thead>
                <tr>
                  <th>
                    <Trans>TOKEN</Trans>
                  </th>
                  <th>
                    <Trans>PRICE</Trans>
                  </th>
                  <th>
                    <Trans>POOL</Trans>
                  </th>
                  <th>
                    <Trans>WEIGHT</Trans>
                  </th>
                  <th>
                    <Trans>UTILIZATION</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleTokens.map((token) => {
                  const tokenInfo = infoTokens[token.address];
                  let utilization = bigNumberify(0);
                  if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                    utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
                  }
                  let maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT;
                  if (tokenInfo.maxUsdgAmount && tokenInfo.maxUsdgAmount.gt(0)) {
                    maxUsdgAmount = tokenInfo.maxUsdgAmount;
                  }
                  const tokenImage = importImage("tokens/" + token.symbol.toUpperCase() + ".png");

                  return (
                    <tr key={token.symbol}>
                      <td>
                        <div className="token-symbol-wrapper">
                          <div className="App-card-title-info">
                            <div className="App-card-title-info-icon">
                              <img src={tokenImage} alt={token.symbol} width="18px" />
                            </div>
                            <div className="App-card-title-info-text">
                              <div className="App-card-info-title">{token.name}</div>
                              <div className="App-card-info-subtitle">({token.symbol})</div>
                            </div>
                            <div>
                              <AssetDropdown assetSymbol={token.symbol} assetInfo={token} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>${formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true)}</td>
                      <td>
                        <TooltipComponent
                          handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 5, true)}`}
                          position="right-bottom"
                          renderContent={() => {
                            return (
                              <>
                                <StatsTooltipRow
                                  label={t`Pool Amount`}
                                  value={`${formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 5, true)} ${
                                    token.symbol
                                  }`}
                                  showDollar={false}
                                />
                                <StatsTooltipRow
                                  label={t`Target Min Amount`}
                                  value={`${formatKeyAmount(tokenInfo, "bufferAmount", token.decimals, 5, true)} ${
                                    token.symbol
                                  }`}
                                  showDollar={false}
                                />
                                <StatsTooltipRow
                                  label={t`Max ${tokenInfo.symbol} Capacity`}
                                  value={formatAmount(maxUsdgAmount, 18, 5, true)}
                                  showDollar={true}
                                />
                              </>
                            );
                          }}
                        />
                      </td>
                      <td>{getWeightText(tokenInfo)}</td>
                      <td>{formatAmount(utilization, 2, 2, false)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="token-grid">
            {visibleTokens.map((token) => {
              const tokenInfo = infoTokens[token.address];
              let utilization = bigNumberify(0);
              if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
              }
              let maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT;
              if (tokenInfo.maxUsdgAmount && tokenInfo.maxUsdgAmount.gt(0)) {
                maxUsdgAmount = tokenInfo.maxUsdgAmount;
              }

              const tokenImage = importImage("tokens/" + token.symbol.toUpperCase() + ".png");

              return (
                <div className="App-card" key={token.symbol}>
                  <div className="App-card-title">
                    <div className="mobile-token-card">
                      <img src={tokenImage} alt={token.symbol} width="20px" />
                      <div className="token-symbol-text">{token.symbol}</div>
                      <div>
                        <AssetDropdown assetSymbol={token.symbol} assetInfo={token} />
                      </div>
                    </div>
                  </div>
                  <div className="App-card-divider"></div>
                  <div className="App-card-content">
                    <div className="App-card-row">
                      <div className="label">
                        <Trans>Price</Trans>
                      </div>
                      <div>${formatKeyAmount(tokenInfo, "maxPrice", USD_DECIMALS, 2, true)}</div>
                    </div>
                    <div className="App-card-row">
                      <div className="label">
                        <Trans>Pool</Trans>
                      </div>
                      <div>
                        <TooltipComponent
                          handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 0, true)}`}
                          position="right-bottom"
                          renderContent={() => {
                            return (
                              <>
                                <StatsTooltipRow
                                  label={t`Pool Amount`}
                                  value={`${formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 0, true)} ${
                                    token.symbol
                                  }`}
                                  showDollar={false}
                                />
                                <StatsTooltipRow
                                  label={t`Target Min Amount`}
                                  value={`${formatKeyAmount(tokenInfo, "bufferAmount", token.decimals, 0, true)} ${
                                    token.symbol
                                  }`}
                                  showDollar={false}
                                />
                                <StatsTooltipRow
                                  label={t`Max ${tokenInfo.symbol} Capacity`}
                                  value={formatAmount(maxUsdgAmount, 18, 0, true)}
                                />
                              </>
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="App-card-row">
                      <div className="label">
                        <Trans>Weight</Trans>
                      </div>
                      <div>{getWeightText(tokenInfo)}</div>
                    </div>
                    <div className="App-card-row">
                      <div className="label">
                        <Trans>Utilization</Trans>
                      </div>
                      <div>{formatAmount(utilization, 2, 2, false)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SEO>
  );
}
