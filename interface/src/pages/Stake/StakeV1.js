import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { ethers } from "ethers";

import { USD_DECIMALS, PRECISION } from "lib/legacy";

import { getContract, XUMT_EXCLUDED_ACCOUNTS } from "config/contracts";

import Reader from "abis/Reader.json";
import Token from "abis/Token.json";
import YieldToken from "abis/YieldToken.json";
import YieldFarm from "abis/YieldFarm.json";

import Modal from "components/Modal/Modal";
import Footer from "components/Footer/Footer";

import "./Stake.css";
import { t, Trans } from "@lingui/macro";
import { CHAIN_ID, getExplorerUrl } from "config/chains";
import { contractFetcher } from "lib/contracts";
import { approveTokens } from "domain/tokens";
import { helperToast } from "lib/helperToast";
import { getInjectedHandler } from "lib/wallets";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { getTokenBySymbol } from "config/tokens";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";

const BASIS_POINTS_DIVISOR = 10000;
const HOURS_PER_YEAR = 8760;

const { AddressZero } = ethers.constants;

function getBalanceAndSupplyData(balances) {
  if (!balances || balances.length === 0) {
    return {};
  }

  const keys = [
    "usdg",
    "umt",
    "xumt",
    "umtUsdg",
    "xumtUsdg",
    "umtUsdgFarm",
    "xumtUsdgFarm",
    "autoUsdg",
    "autoUsdgFarm",
  ];
  const balanceData = {};
  const supplyData = {};
  const propsLength = 2;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    balanceData[key] = balances[i * propsLength];
    supplyData[key] = balances[i * propsLength + 1];
  }

  return { balanceData, supplyData };
}

function getStakingData(stakingInfo) {
  if (!stakingInfo || stakingInfo.length === 0) {
    return;
  }

  const keys = [
    "usdg",
    "xumt",
    "umtUsdgFarmXumt",
    "umtUsdgFarmNative",
    "xumtUsdgFarmXumt",
    "xumtUsdgFarmNative",
    "autoUsdgFarmXumt",
    "autoUsdgFarmNative",
  ];
  const data = {};
  const propsLength = 2;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = {
      claimable: stakingInfo[i * propsLength],
      tokensPerInterval: stakingInfo[i * propsLength + 1],
    };
  }

  return data;
}

function getTotalStakedData(totalStakedInfo) {
  if (!totalStakedInfo || totalStakedInfo.length === 0) {
    return;
  }

  const keys = ["usdg", "xumt"];
  const data = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = totalStakedInfo[i];
  }

  return data;
}

function getPairData(pairInfo) {
  const keys = ["umtUsdg", "xumtUsdg", "bnbBusd", "autoUsdg"];
  if (!pairInfo || pairInfo.length === 0 || pairInfo.length !== keys.length * 2) {
    return;
  }

  const data = {};
  const propsLength = 2;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = {
      balance0: pairInfo[i * propsLength],
      balance1: pairInfo[i * propsLength + 1],
    };
  }

  return data;
}

function getProcessedData(balanceData, supplyData, stakingData, totalStakedData, pairData, xumtSupply) {
  if (!balanceData || !supplyData || !stakingData || !totalStakedData || !pairData || !xumtSupply) {
    return {};
  }

  if (!supplyData.umtUsdg || !supplyData.xumtUsdg || !supplyData.autoUsdg) {
    return {};
  }

  // const umtPrice = pairData.umtUsdg.balance1.mul(PRECISION).div(pairData.umtUsdg.balance0)
  const xumtPrice = pairData.xumtUsdg.balance0.eq(0)
    ? bigNumberify(0)
    : pairData.xumtUsdg.balance1.mul(PRECISION).div(pairData.xumtUsdg.balance0);
  const umtUsdgPrice = supplyData.umtUsdg.eq(0)
    ? bigNumberify(0)
    : pairData.umtUsdg.balance1.mul(PRECISION).mul(2).div(supplyData.umtUsdg);
  const xumtUsdgPrice = supplyData.xumtUsdg.eq(0)
    ? bigNumberify(0)
    : pairData.xumtUsdg.balance1.mul(PRECISION).mul(2).div(supplyData.xumtUsdg);
  const bnbPrice = pairData.bnbBusd.balance1.mul(PRECISION).div(pairData.bnbBusd.balance0);
  const autoUsdgPrice = supplyData.autoUsdg.eq(0)
    ? bigNumberify(0)
    : pairData.autoUsdg.balance1.mul(PRECISION).mul(2).div(supplyData.autoUsdg);

  const usdgAnnualRewardsUsd = stakingData.usdg.tokensPerInterval
    .mul(bnbPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const xumtAnnualRewardsUsd = stakingData.xumt.tokensPerInterval
    .mul(bnbPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));

  const umtUsdgAnnualRewardsXmgtUsd = stakingData.umtUsdgFarmXumt.tokensPerInterval
    .mul(xumtPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const umtUsdgAnnualRewardsNativeUsd = stakingData.umtUsdgFarmNative.tokensPerInterval
    .mul(bnbPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const umtUsdgTotalAnnualRewardsUsd = umtUsdgAnnualRewardsXmgtUsd.add(umtUsdgAnnualRewardsNativeUsd);

  const xumtUsdgAnnualRewardsXmgtUsd = stakingData.xumtUsdgFarmXumt.tokensPerInterval
    .mul(xumtPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const xumtUsdgAnnualRewardsNativeUsd = stakingData.xumtUsdgFarmNative.tokensPerInterval
    .mul(bnbPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const xumtUsdgTotalAnnualRewardsUsd = xumtUsdgAnnualRewardsXmgtUsd.add(xumtUsdgAnnualRewardsNativeUsd);

  const autoUsdgAnnualRewardsXumtUsd = stakingData.autoUsdgFarmXumt.tokensPerInterval
    .mul(xumtPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const autoUsdgAnnualRewardsNativeUsd = stakingData.autoUsdgFarmNative.tokensPerInterval
    .mul(bnbPrice)
    .mul(HOURS_PER_YEAR)
    .div(expandDecimals(1, 18));
  const autoUsdgTotalAnnualRewardsUsd = autoUsdgAnnualRewardsXumtUsd.add(autoUsdgAnnualRewardsNativeUsd);

  const data = {};
  data.usdgBalance = balanceData.usdg;
  data.usdgSupply = supplyData.usdg;
  data.usdgTotalStaked = totalStakedData.usdg;
  data.usdgTotalStakedUsd = totalStakedData.usdg.mul(PRECISION).div(expandDecimals(1, 18));
  data.usdgSupplyUsd = supplyData.usdg.mul(PRECISION).div(expandDecimals(1, 18));
  data.usdgApr = data.usdgTotalStaked.eq(0)
    ? undefined
    : usdgAnnualRewardsUsd
        .mul(BASIS_POINTS_DIVISOR)
        .div(totalStakedData.usdg)
        .mul(expandDecimals(1, 18))
        .div(PRECISION);
  data.usdgRewards = stakingData.usdg.claimable;

  data.xumtBalance = balanceData.xumt;
  data.xumtBalanceUsd = balanceData.xumt.mul(xumtPrice).div(expandDecimals(1, 18));
  data.xumtSupply = xumtSupply;
  data.xumtTotalStaked = totalStakedData.xumt;
  data.xumtTotalStakedUsd = totalStakedData.xumt.mul(xumtPrice).div(expandDecimals(1, 18));
  data.xumtSupplyUsd = xumtSupply.mul(xumtPrice).div(expandDecimals(1, 18));
  data.xumtApr = data.xumtSupplyUsd.eq(0)
    ? bigNumberify(0)
    : xumtAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.xumtTotalStakedUsd);
  data.xumtRewards = stakingData.xumt.claimable;

  data.umtUsdgFarmBalance = balanceData.umtUsdgFarm;

  data.umtUsdgBalance = balanceData.umtUsdg;
  data.umtUsdgBalanceUsd = balanceData.umtUsdg.mul(umtUsdgPrice).div(expandDecimals(1, 18));
  data.umtUsdgSupply = supplyData.umtUsdg;
  data.umtUsdgSupplyUsd = supplyData.umtUsdg.mul(umtUsdgPrice).div(expandDecimals(1, 18));
  data.umtUsdgStaked = balanceData.umtUsdgFarm;
  data.umtUsdgStakedUsd = balanceData.umtUsdgFarm.mul(umtUsdgPrice).div(expandDecimals(1, 18));
  data.umtUsdgFarmSupplyUsd = supplyData.umtUsdgFarm.mul(umtUsdgPrice).div(expandDecimals(1, 18));
  data.umtUsdgApr = data.umtUsdgSupplyUsd.eq(0)
    ? bigNumberify(0)
    : data.umtUsdgFarmSupplyUsd.eq(0)
    ? undefined
    : umtUsdgTotalAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.umtUsdgSupplyUsd);
  data.umtUsdgXumtRewards = stakingData.umtUsdgFarmXumt.claimable;
  data.umtUsdgNativeRewards = stakingData.umtUsdgFarmNative.claimable;
  data.umtUsdgTotalRewards = data.umtUsdgXumtRewards.add(data.umtUsdgNativeRewards);
  data.umtUsdgTotalStaked = supplyData.umtUsdgFarm;
  data.umtUsdgTotalStakedUsd = supplyData.umtUsdgFarm.mul(umtUsdgPrice).div(expandDecimals(1, 18));

  data.xumtUsdgBalance = balanceData.xumtUsdg;
  data.xumtUsdgFarmBalance = balanceData.xumtUsdgFarm;
  data.xumtUsdgBalanceUsd = balanceData.xumtUsdg.mul(xumtUsdgPrice).div(expandDecimals(1, 18));
  data.xumtUsdgSupply = supplyData.xumtUsdg;
  data.xumtUsdgSupplyUsd = supplyData.xumtUsdg.mul(xumtUsdgPrice).div(expandDecimals(1, 18));
  data.xumtUsdgStaked = balanceData.xumtUsdgFarm;
  data.xumtUsdgStakedUsd = balanceData.xumtUsdgFarm.mul(xumtUsdgPrice).div(expandDecimals(1, 18));
  data.xumtUsdgFarmSupplyUsd = supplyData.xumtUsdgFarm.mul(xumtUsdgPrice).div(expandDecimals(1, 18));
  data.xumtUsdgApr = data.xumtUsdgFarmSupplyUsd.eq(0)
    ? undefined
    : xumtUsdgTotalAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.xumtUsdgFarmSupplyUsd);
  data.xumtUsdgXumtRewards = stakingData.xumtUsdgFarmXumt.claimable;
  data.xumtUsdgNativeRewards = stakingData.xumtUsdgFarmNative.claimable;
  data.xumtUsdgTotalRewards = data.xumtUsdgXumtRewards.add(data.xumtUsdgNativeRewards);
  data.xumtUsdgTotalStaked = supplyData.xumtUsdgFarm;
  data.xumtUsdgTotalStakedUsd = supplyData.xumtUsdgFarm.mul(xumtUsdgPrice).div(expandDecimals(1, 18));

  data.autoUsdgBalance = balanceData.autoUsdg;
  data.autoUsdgFarmBalance = balanceData.autoUsdgFarm;
  data.autoUsdgBalanceUsd = balanceData.autoUsdg.mul(autoUsdgPrice).div(expandDecimals(1, 18));
  data.autoUsdgStaked = balanceData.autoUsdgFarm;
  data.autoUsdgStakedUsd = balanceData.autoUsdgFarm.mul(autoUsdgPrice).div(expandDecimals(1, 18));
  data.autoUsdgFarmSupplyUsd = supplyData.autoUsdgFarm.mul(autoUsdgPrice).div(expandDecimals(1, 18));
  data.autoUsdgApr = data.autoUsdgFarmSupplyUsd.eq(0)
    ? bigNumberify(0)
    : autoUsdgTotalAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.autoUsdgFarmSupplyUsd);
  data.autoUsdgXumtRewards = stakingData.autoUsdgFarmXumt.claimable;
  data.autoUsdgNativeRewards = stakingData.autoUsdgFarmNative.claimable;
  data.autoUsdgTotalRewards = data.autoUsdgXumtRewards.add(data.autoUsdgNativeRewards);
  data.autoUsdgTotalStaked = supplyData.autoUsdgFarm;
  data.autoUsdgTotalStakedUsd = supplyData.autoUsdgFarm.mul(autoUsdgPrice).div(expandDecimals(1, 18));

  data.totalStakedUsd = data.usdgTotalStakedUsd
    .add(data.xumtTotalStakedUsd)
    .add(data.umtUsdgTotalStakedUsd)
    .add(data.xumtUsdgTotalStakedUsd)
    .add(data.autoUsdgTotalStakedUsd);

  return data;
}

function StakeModal(props) {
  const {
    isVisible,
    setIsVisible,
    title,
    maxAmount,
    value,
    setValue,
    active,
    account,
    library,
    stakingTokenSymbol,
    stakingTokenAddress,
    farmAddress,
    chainId,
  } = props;
  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: tokenAllowance, mutate: updateTokenAllowance } = useSWR(
    [active, chainId, stakingTokenAddress, "allowance", account, farmAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  useEffect(() => {
    if (active) {
      library.on("block", () => {
        updateTokenAllowance(undefined, true);
      });
      return () => {
        library.removeAllListeners("block");
      };
    }
  }, [active, library, updateTokenAllowance]);

  let amount = parseValue(value, 18);
  const needApproval = tokenAllowance && amount && amount.gt(tokenAllowance);

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    if (needApproval) {
      approveTokens({
        setIsApproving,
        library,
        tokenAddress: stakingTokenAddress,
        spender: farmAddress,
        chainId: CHAIN_ID,
      });
      return;
    }

    setIsStaking(true);
    const contract = new ethers.Contract(farmAddress, YieldFarm.abi, library.getSigner());
    contract
      .stake(amount)
      .then(async (res) => {
        const txUrl = getExplorerUrl(CHAIN_ID) + "tx/" + res.hash;
        helperToast.success(
          <div>
            <Trans>
              Stake submitted! <ExternalLink href={txUrl}>View status.</ExternalLink>
            </Trans>
            <br />
          </div>
        );
        setIsVisible(false);
      })
      .catch((e) => {
        console.error(e);
        helperToast.error(t`Stake failed`);
      })
      .finally(() => {
        setIsStaking(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isApproving) {
      return false;
    }
    if (isStaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isApproving) {
      return t`Approving ${stakingTokenSymbol}...`;
    }
    if (needApproval) {
      return t`Approve ${stakingTokenSymbol}`;
    }
    if (isStaking) {
      return t`Staking...`;
    }
    return t`Stake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Stake</Trans>
              </div>
            </div>
            <div className="muted align-right clickable" onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}>
              <Trans>Max: {formatAmount(maxAmount, 18, 4, true)}</Trans>
            </div>
          </div>
          <div className="Exchange-swap-section-bottom">
            <div>
              <input
                type="number"
                placeholder="0.0"
                className="Exchange-swap-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="PositionEditor-token-symbol">{stakingTokenSymbol}</div>
          </div>
        </div>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function UnstakeModal(props) {
  const { isVisible, setIsVisible, title, maxAmount, value, setValue, library, stakingTokenSymbol, farmAddress } =
    props;
  const [isUnstaking, setIsUnstaking] = useState(false);

  let amount = parseValue(value, 18);

  const getError = () => {
    if (!amount) {
      return t`Enter an amount`;
    }
    if (amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    setIsUnstaking(true);
    const contract = new ethers.Contract(farmAddress, YieldFarm.abi, library.getSigner());
    contract
      .unstake(amount)
      .then(async (res) => {
        const txUrl = getExplorerUrl(CHAIN_ID) + "tx/" + res.hash;
        helperToast.success(
          <div>
            <Trans>
              Unstake submitted! <ExternalLink href={txUrl}>View status.</ExternalLink>
            </Trans>
            <br />
          </div>
        );
        setIsVisible(false);
      })
      .catch((e) => {
        console.error(e);
        helperToast.error(t`Unstake failed`);
      })
      .finally(() => {
        setIsUnstaking(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isUnstaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isUnstaking) {
      return t`Unstaking...`;
    }
    return t`Unstake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Unstake</Trans>
              </div>
            </div>
            <div className="muted align-right clickable" onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}>
              <Trans>Max: {formatAmount(maxAmount, 18, 4, true)}</Trans>
            </div>
          </div>
          <div className="Exchange-swap-section-bottom">
            <div>
              <input
                type="number"
                placeholder="0.0"
                className="Exchange-swap-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="PositionEditor-token-symbol">{stakingTokenSymbol}</div>
          </div>
        </div>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function StakeV1() {
  const { chainId } = useChainId();
  const [isStakeModalVisible, setIsStakeModalVisible] = useState(false);
  const [stakeModalTitle, setStakeModalTitle] = useState("");
  const [stakeModalMaxAmount, setStakeModalMaxAmount] = useState(undefined);
  const [stakeValue, setStakeValue] = useState("");
  const [stakingTokenAddress, setStakingTokenAddress] = useState("");
  const [stakingFarmAddress, setStakingFarmAddress] = useState("");

  const [isUnstakeModalVisible, setIsUnstakeModalVisible] = useState(false);
  const [unstakeModalTitle, setUnstakeModalTitle] = useState("");
  const [unstakeModalMaxAmount, setUnstakeModalMaxAmount] = useState(undefined);
  const [unstakeValue, setUnstakeValue] = useState("");
  const [unstakingFarmAddress, setUnstakingFarmAddress] = useState("");

  const { activate, active, account, library } = useWeb3React();
  const connectWallet = getInjectedHandler(activate);

  const readerAddress = getContract(CHAIN_ID, "Reader");
  const ammFactoryAddressV2 = getContract(CHAIN_ID, "AmmFactoryV2");
  const usdgAddress = getContract(CHAIN_ID, "USDG");
  const umtAddress = getContract(CHAIN_ID, "UMT");
  const xumtAddress = getContract(CHAIN_ID, "XUMT");
  const autoAddress = getContract(CHAIN_ID, "AUTO");
  const nativeTokenAddress = getContract(CHAIN_ID, "NATIVE_TOKEN");
  const busdAddress = getTokenBySymbol(CHAIN_ID, "BUSD").address;

  const umtUsdgPairAddress = getContract(CHAIN_ID, "UMT_USDG_PAIR");
  const xumtUsdgPairAddress = getContract(CHAIN_ID, "XUMT_USDG_PAIR");
  const autoUsdgPairAddress = getContract(CHAIN_ID, "AUTO_USDG_PAIR");
  const umtUsdgFarmAddress = getContract(CHAIN_ID, "UMT_USDG_FARM");
  const xumtUsdgFarmAddress = getContract(CHAIN_ID, "XUMT_USDG_FARM");
  const autoUsdgFarmAddress = getContract(CHAIN_ID, "AUTO_USDG_FARM");

  const usdgYieldTracker = getContract(CHAIN_ID, "USDG_YIELD_TRACKER");
  const xumtYieldTracker = getContract(CHAIN_ID, "XUMT_YIELD_TRACKER");
  const umtUsdgFarmTrackerXumt = getContract(CHAIN_ID, "UMT_USDG_FARM_TRACKER_XUMT");
  const umtUsdgFarmTrackerNative = getContract(CHAIN_ID, "UMT_USDG_FARM_TRACKER_NATIVE");
  const xumtUsdgFarmTrackerXumt = getContract(CHAIN_ID, "XUMT_USDG_FARM_TRACKER_XUMT");
  const xumtUsdgFarmTrackerNative = getContract(CHAIN_ID, "XUMT_USDG_FARM_TRACKER_NATIVE");
  const autoUsdgFarmTrackerXumt = getContract(CHAIN_ID, "AUTO_USDG_FARM_TRACKER_XUMT");
  const autoUsdgFarmTrackerNative = getContract(CHAIN_ID, "AUTO_USDG_FARM_TRACKER_NATIVE");

  const tokens = [
    usdgAddress,
    umtAddress,
    xumtAddress,
    umtUsdgPairAddress,
    xumtUsdgPairAddress,
    umtUsdgFarmAddress,
    xumtUsdgFarmAddress,
    autoUsdgPairAddress,
    autoUsdgFarmAddress,
  ];

  const yieldTrackers = [
    usdgYieldTracker,
    xumtYieldTracker,
    umtUsdgFarmTrackerXumt,
    umtUsdgFarmTrackerNative,
    xumtUsdgFarmTrackerXumt,
    xumtUsdgFarmTrackerNative,
    autoUsdgFarmTrackerXumt,
    autoUsdgFarmTrackerNative,
  ];

  const pairTokens = [
    umtAddress,
    usdgAddress,
    xumtAddress,
    usdgAddress,
    nativeTokenAddress,
    busdAddress,
    autoAddress,
    usdgAddress,
  ];

  const yieldTokens = [usdgAddress, xumtAddress];

  const { data: xumtSupply, mutate: updateXumtSupply } = useSWR(
    [active, chainId, readerAddress, "getTokenSupply", xumtAddress],
    {
      fetcher: contractFetcher(library, Reader, [XUMT_EXCLUDED_ACCOUNTS]),
    }
  );

  const { data: balances, mutate: updateBalances } = useSWR(
    ["Stake:balances", chainId, readerAddress, "getTokenBalancesWithSupplies", account || AddressZero],
    {
      fetcher: contractFetcher(library, Reader, [tokens]),
    }
  );

  const { data: stakingInfo, mutate: updateStakingInfo } = useSWR(
    [active, chainId, readerAddress, "getStakingInfo", account || AddressZero],
    {
      fetcher: contractFetcher(library, Reader, [yieldTrackers]),
    }
  );

  const { data: totalStakedInfo, mutate: updateTotalStakedInfo } = useSWR(
    [active, chainId, readerAddress, "getTotalStaked"],
    {
      fetcher: contractFetcher(library, Reader, [yieldTokens]),
    }
  );

  const { data: pairInfo, mutate: updatePairInfo } = useSWR(
    [active, chainId, readerAddress, "getPairInfo", ammFactoryAddressV2],
    {
      fetcher: contractFetcher(library, Reader, [pairTokens]),
    }
  );

  const { balanceData, supplyData } = getBalanceAndSupplyData(balances);
  const stakingData = getStakingData(stakingInfo);
  const pairData = getPairData(pairInfo);
  const totalStakedData = getTotalStakedData(totalStakedInfo);

  const processedData = getProcessedData(balanceData, supplyData, stakingData, totalStakedData, pairData, xumtSupply);

  const buyXumtUrl = `https://exchange.pancakeswap.finance/#/swap?outputCurrency=${xumtAddress}&inputCurrency=${usdgAddress}`;
  const buyumtUrl = `https://exchange.pancakeswap.finance/#/swap?outputCurrency=${umtAddress}&inputCurrency=${usdgAddress}`;

  const addumtUsdgLpUrl = `https://exchange.pancakeswap.finance/#/add/${umtAddress}/${usdgAddress}`;
  const addXumtUsdgLpUrl = `https://exchange.pancakeswap.finance/#/add/${xumtAddress}/${usdgAddress}`;

  const buyAutoUrl = `https://exchange.pancakeswap.finance/#/swap?outputCurrency=${autoAddress}&inputCurrency=${nativeTokenAddress}`;
  const addAutoUsdgLpUrl = `https://exchange.pancakeswap.finance/#/add/${autoAddress}/${usdgAddress}`;

  useEffect(() => {
    if (active) {
      library.on("block", () => {
        updateXumtSupply(undefined, true);
        updateBalances(undefined, true);
        updateStakingInfo(undefined, true);
        updateTotalStakedInfo(undefined, true);
        updatePairInfo(undefined, true);
      });
      return () => {
        library.removeAllListeners("block");
      };
    }
  }, [active, library, updateXumtSupply, updateBalances, updateStakingInfo, updateTotalStakedInfo, updatePairInfo]);

  const claim = (farmAddress, rewards) => {
    if (!active || !account) {
      helperToast.error(t`Wallet not yet connected`);
      return;
    }
    if (chainId !== CHAIN_ID) {
      helperToast.error(t`Incorrect Network`);
      return;
    }
    if (!rewards || rewards.eq(0)) {
      helperToast.error(t`No rewards to claim yet`);
      return;
    }

    const contract = new ethers.Contract(farmAddress, YieldToken.abi, library.getSigner());
    contract
      .claim(account)
      .then(async (res) => {
        const txUrl = getExplorerUrl(CHAIN_ID) + "tx/" + res.hash;
        helperToast.success(
          <div>
            <Trans>
              Claim submitted! <ExternalLink href={txUrl}>View status.</ExternalLink>
            </Trans>
            <br />
          </div>
        );
      })
      .catch((e) => {
        console.error(e);
        helperToast.error(t`Claim failed`);
      });
  };

  const showUnstakeumtUsdgModal = () => {
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle("Unstake UMT-USDG");
    setUnstakeModalMaxAmount(processedData.umtUsdgFarmBalance);
    setUnstakeValue("");
    setUnstakingFarmAddress(umtUsdgFarmAddress);
  };

  const showUnstakeXumtUsdgModal = () => {
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle("Unstake xUMT-USDG");
    setUnstakeModalMaxAmount(processedData.xumtUsdgFarmBalance);
    setUnstakeValue("");
    setUnstakingFarmAddress(xumtUsdgFarmAddress);
  };

  const showStakeAutoUsdgModal = () => {
    setIsStakeModalVisible(true);
    setStakeModalTitle("Stake AUTO-USDG");
    setStakeModalMaxAmount(processedData.autoUsdgBalance);
    setStakeValue("");
    setStakingTokenAddress(autoUsdgPairAddress);
    setStakingFarmAddress(autoUsdgFarmAddress);
  };

  const showUnstakeAutoUsdgModal = () => {
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle("Unstake AUTO-USDG");
    setUnstakeModalMaxAmount(processedData.autoUsdgFarmBalance);
    setUnstakeValue("");
    setUnstakingFarmAddress(autoUsdgFarmAddress);
  };

  const hasFeeDistribution = true;

  return (
    <div className="Stake Page page-layout">
      <StakeModal
        isVisible={isStakeModalVisible}
        setIsVisible={setIsStakeModalVisible}
        title={stakeModalTitle}
        maxAmount={stakeModalMaxAmount}
        value={stakeValue}
        setValue={setStakeValue}
        active={active}
        account={account}
        library={library}
        stakingTokenAddress={stakingTokenAddress}
        farmAddress={stakingFarmAddress}
      />
      <UnstakeModal
        isVisible={isUnstakeModalVisible}
        setIsVisible={setIsUnstakeModalVisible}
        title={unstakeModalTitle}
        maxAmount={unstakeModalMaxAmount}
        value={unstakeValue}
        setValue={setUnstakeValue}
        active={active}
        account={account}
        library={library}
        farmAddress={unstakingFarmAddress}
      />
      <div className="Stake-title App-hero">
        <div className="Stake-title-primary App-hero-primary">
          ${formatKeyAmount(processedData, "totalStakedUsd", 30, 0, true)}
        </div>
        <div className="Stake-title-secondary">
          <Trans>Total Assets Staked</Trans>
        </div>
      </div>
      <div className="Stake-note">
        <Trans>
          The UMT protocol is in beta, please read the&nbsp;
          <ExternalLink href="https://umt.gitbook.io/umt/staking">staking details</ExternalLink>
          &nbsp; before participating.
        </Trans>
      </div>
      <div className="App-warning Stake-warning">
        <Trans>
          The <Link to="/migrate">$UNITY migration</Link> is in progress, please migrate your UMT, xUMT, UMT-USDG and
          xUMT-USDG tokens.
          <br />
          USDG tokens will continue to function as before and do not need to be migrated.
        </Trans>
      </div>
      <div className="Stake-cards">
        <div className="App-card primary">
          <div className="Stake-card-title App-card-title">USDG</div>
          <div className="Stake-card-bottom App-card-content">
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>APR</Trans>
              </div>
              <div>
                {!hasFeeDistribution && "TBC"}
                {hasFeeDistribution && `${formatKeyAmount(processedData, "usdgApr", 2, 2, true)}%`}
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "usdgBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "usdgBalance", 18, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Wallet</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "usdgBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "usdgBalance", 18, 2, true)})
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Rewards</Trans>
              </div>
              <div>
                {!hasFeeDistribution && "TBC"}
                {hasFeeDistribution && `${formatKeyAmount(processedData, "usdgRewards", 18, 8, true)} WBNB`}
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "usdgTotalStaked", 18, 2, true)} ($
                {formatKeyAmount(processedData, "usdgTotalStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Supply</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "usdgSupply", 18, 2, true)} ($
                {formatKeyAmount(processedData, "usdgSupplyUsd", 30, 2, true)})
              </div>
            </div>
            <div className="App-card-options">
              <Link className="App-button-option App-card-option" to="/trade">
                Get USDG
              </Link>
              {active && (
                <button
                  className="App-button-option App-card-option"
                  onClick={() => claim(usdgAddress, processedData.usdgRewards)}
                >
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="App-button-option App-card-option" onClick={connectWallet}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="App-card">
          <div className="Stake-card-title App-card-title">xUMT</div>
          <div className="Stake-card-bottom App-card-content">
            <div className="Stake-info App-card-row">
              <div className="label">APR</div>
              <div>
                0.00% (
                <Link to="/migrate">
                  <Trans>Migrate</Trans>
                </Link>
                )
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "xumtBalanceUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Wallet</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "xumtBalanceUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Rewards</Trans>
              </div>
              <div>
                {!hasFeeDistribution && "TBC"}
                {hasFeeDistribution && `${formatKeyAmount(processedData, "xumtRewards", 18, 8, true)} WBNB`}
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtTotalStaked", 18, 2, true)} ($
                {formatKeyAmount(processedData, "xumtTotalStakedUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Supply</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtSupply", 18, 2, true)} ($
                {formatKeyAmount(processedData, "xumtSupplyUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="App-card-options">
              <ExternalLink className="App-button-option App-card-option" href={buyXumtUrl}>
                Get xUMT
              </ExternalLink>
              {active && (
                <button
                  className="App-button-option App-card-option"
                  onClick={() => claim(xumtAddress, processedData.xumtRewards)}
                >
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="App-button-option App-card-option" onClick={connectWallet}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="App-card">
          <div className="Stake-card-title App-card-title">UMT-USDG LP</div>
          <div className="Stake-card-bottom App-card-content">
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>APR</Trans>
              </div>
              <div>
                0.00% (
                <Link to="/migrate">
                  <Trans>Migrate</Trans>
                </Link>
                )
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "umtUsdgStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "umtUsdgStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Wallet</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "umtUsdgBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "umtUsdgBalanceUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Rewards</Trans>
              </div>
              <div>
                {hasFeeDistribution &&
                  processedData.umtUsdgNativeRewards &&
                  processedData.umtUsdgNativeRewards.gt(0) &&
                  `${formatKeyAmount(processedData, "umtUsdgNativeRewards", 18, 8, true)} WBNB, `}
                {formatKeyAmount(processedData, "umtUsdgXumtRewards", 18, 4, true)} xUMT
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "umtUsdgTotalStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "umtUsdgTotalStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="App-card-options">
              <ExternalLink className="App-button-option App-card-option" href={buyumtUrl}>
                Get UMT
              </ExternalLink>
              <ExternalLink className="App-button-option App-card-option" href={addumtUsdgLpUrl}>
                <Trans>Create</Trans>
              </ExternalLink>
              {active && (
                <button className="App-button-option App-card-option" onClick={() => showUnstakeumtUsdgModal()}>
                  <Trans>Unstake</Trans>
                </button>
              )}
              {active && (
                <button
                  className="App-button-option App-card-option"
                  onClick={() => claim(umtUsdgFarmAddress, processedData.umtUsdgTotalRewards)}
                >
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="App-button-option App-card-option" onClick={connectWallet}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="App-card">
          <div className="Stake-card-title App-card-title">xUMT-USDG LP</div>
          <div className="Stake-card-bottom App-card-content">
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>APR</Trans>
              </div>
              <div>
                0.00% (
                <Link to="/migrate">
                  <Trans>Migrate</Trans>
                </Link>
                )
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtUsdgStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "xumtUsdgStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Wallet</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtUsdgBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "xumtUsdgBalanceUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Rewards</Trans>
              </div>
              <div>
                {hasFeeDistribution &&
                  processedData.xumtUsdgNativeRewards &&
                  processedData.xumtUsdgNativeRewards.gt(0) &&
                  `${formatKeyAmount(processedData, "xumtUsdgNativeRewards", 18, 8, true)} WBNB, `}
                {formatKeyAmount(processedData, "xumtUsdgXumtRewards", 18, 4, true)} xUMT
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "xumtUsdgTotalStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "xumtUsdgTotalStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="App-card-options">
              <ExternalLink className="App-button-option App-card-option" href={buyXumtUrl}>
                Get xUMT
              </ExternalLink>
              <ExternalLink className="App-button-option App-card-option" href={addXumtUsdgLpUrl}>
                <Trans>Create</Trans>
              </ExternalLink>
              {active && (
                <button className="App-button-option App-card-option" onClick={() => showUnstakeXumtUsdgModal()}>
                  <Trans>Unstake</Trans>
                </button>
              )}
              {active && (
                <button
                  className="App-button-option App-card-option"
                  onClick={() => claim(xumtUsdgFarmAddress, processedData.xumtUsdgTotalRewards)}
                >
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="App-button-option App-card-option" onClick={connectWallet}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="App-card">
          <div className="Stake-card-title App-card-title">AUTO-USDG LP</div>
          <div className="Stake-card-bottom App-card-content">
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>APR</Trans>
              </div>
              <div>{formatKeyAmount(processedData, "autoUsdgApr", 2, 2, true)}%</div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "autoUsdgStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "autoUsdgStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Wallet</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "autoUsdgBalance", 18, 2, true)} ($
                {formatKeyAmount(processedData, "autoUsdgBalanceUsd", USD_DECIMALS, 2, true)})
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Rewards</Trans>
              </div>
              <div>{formatKeyAmount(processedData, "autoUsdgXumtRewards", 18, 4, true)} xUMT</div>
            </div>
            <div className="Stake-info App-card-row">
              <div className="label">
                <Trans>Total Staked</Trans>
              </div>
              <div>
                {formatKeyAmount(processedData, "autoUsdgTotalStaked", 18, 4, true)} ($
                {formatKeyAmount(processedData, "autoUsdgTotalStakedUsd", 30, 2, true)})
              </div>
            </div>
            <div className="App-card-options">
              <ExternalLink className="App-button-option App-card-option" href={buyAutoUrl}>
                Get AUTO
              </ExternalLink>
              <ExternalLink className="App-button-option App-card-option" href={addAutoUsdgLpUrl}>
                <Trans>Create</Trans>
              </ExternalLink>
              {active && (
                <button className="App-button-option App-card-option" onClick={() => showStakeAutoUsdgModal()}>
                  <Trans>Stake</Trans>
                </button>
              )}
              {active && (
                <button className="App-button-option App-card-option" onClick={() => showUnstakeAutoUsdgModal()}>
                  <Trans>Unstake</Trans>
                </button>
              )}
              {active && (
                <button
                  className="App-button-option App-card-option"
                  onClick={() => claim(autoUsdgFarmAddress, processedData.autoUsdgTotalRewards)}
                >
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="App-button-option App-card-option" onClick={connectWallet}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
