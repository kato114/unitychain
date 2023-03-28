import React from "react";

import useSWR from "swr";

import {
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
} from "lib/legacy";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import UlpManager from "abis/UlpManager.json";

import { useWeb3React } from "@web3-react/core";

import { useUnityPrice } from "domain/legacy";

import { getContract } from "config/contracts";
import { contractFetcher } from "lib/contracts";
import { formatKeyAmount } from "lib/numbers";

export default function APRLabel({ chainId, label }) {
  let { active } = useWeb3React();

  const rewardReaderAddress = getContract(chainId, "RewardReader");
  const readerAddress = getContract(chainId, "Reader");

  const vaultAddress = getContract(chainId, "Vault");
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");
  const unityAddress = getContract(chainId, "UNITY");
  const esUnityAddress = getContract(chainId, "ES_UNITY");
  const bnUnityAddress = getContract(chainId, "BN_UNITY");
  const ulpAddress = getContract(chainId, "ULP");

  const stakedUnityTrackerAddress = getContract(chainId, "StakedUnityTracker");
  const bonusUnityTrackerAddress = getContract(chainId, "BonusUnityTracker");
  const feeUnityTrackerAddress = getContract(chainId, "FeeUnityTracker");

  const stakedUlpTrackerAddress = getContract(chainId, "StakedUlpTracker");
  const feeUlpTrackerAddress = getContract(chainId, "FeeUlpTracker");

  const ulpManagerAddress = getContract(chainId, "UlpManager");

  const unityVesterAddress = getContract(chainId, "UnityVester");
  const ulpVesterAddress = getContract(chainId, "UlpVester");

  const vesterAddresses = [unityVesterAddress, ulpVesterAddress];

  const walletTokens = [unityAddress, esUnityAddress, ulpAddress, stakedUnityTrackerAddress];
  const depositTokens = [
    unityAddress,
    esUnityAddress,
    stakedUnityTrackerAddress,
    bonusUnityTrackerAddress,
    bnUnityAddress,
    ulpAddress,
  ];
  const rewardTrackersForDepositBalances = [
    stakedUnityTrackerAddress,
    stakedUnityTrackerAddress,
    bonusUnityTrackerAddress,
    feeUnityTrackerAddress,
    feeUnityTrackerAddress,
    feeUlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    stakedUnityTrackerAddress,
    bonusUnityTrackerAddress,
    feeUnityTrackerAddress,
    stakedUlpTrackerAddress,
    feeUlpTrackerAddress,
  ];

  const { data: walletBalances } = useSWR(
    [`StakeV2:walletBalances:${active}`, chainId, readerAddress, "getTokenBalancesWithSupplies", PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(undefined, ReaderV2, [walletTokens]),
    }
  );

  const { data: depositBalances } = useSWR(
    [`StakeV2:depositBalances:${active}`, chainId, rewardReaderAddress, "getDepositBalances", PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(undefined, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
    }
  );

  const { data: stakingInfo } = useSWR(
    [`StakeV2:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(undefined, RewardReader, [rewardTrackersForStakingInfo]),
    }
  );

  const { data: stakedUnitySupply } = useSWR(
    [`StakeV2:stakedUnitySupply:${active}`, chainId, unityAddress, "balanceOf", stakedUnityTrackerAddress],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );

  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, ulpManagerAddress, "getAums"], {
    fetcher: contractFetcher(undefined, UlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: contractFetcher(undefined, Vault),
    }
  );

  const { data: vestingInfo } = useSWR(
    [`StakeV2:vestingInfo:${active}`, chainId, readerAddress, "getVestingInfo", PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(undefined, ReaderV2, [vesterAddresses]),
    }
  );

  const { unityPrice } = useUnityPrice(chainId, {}, active);

  // const unitySupplyUrl = getServerUrl(chainId, "/unity_supply");
  // const { data: unitySupply } = useSWR([unitySupplyUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });

  const { data: unitySupply } = useSWR([`APRLabel:unitySupply:${active}`, chainId, unityAddress, "totalSupply"], {
    fetcher: contractFetcher(undefined, Token),
  });

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  const { balanceData, supplyData } = getBalanceAndSupplyData(walletBalances);
  const depositBalanceData = getDepositBalanceData(depositBalances);
  const stakingData = getStakingData(stakingInfo);
  const vestingData = getVestingData(vestingInfo);

  const processedData = getProcessedData(
    balanceData,
    supplyData,
    depositBalanceData,
    stakingData,
    vestingData,
    aum,
    nativeTokenPrice,
    stakedUnitySupply,
    unityPrice,
    unitySupply
  );
  return <>{`${formatKeyAmount(processedData, label, 2, 2, true)}%`}</>;
}
