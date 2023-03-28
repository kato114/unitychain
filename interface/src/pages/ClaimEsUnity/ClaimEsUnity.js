import React, { useState } from "react";
import useSWR from "swr";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { PLACEHOLDER_ACCOUNT } from "lib/legacy";

import { getContract } from "config/contracts";

import Token from "abis/Token.json";
import RewardReader from "abis/RewardReader.json";

import Checkbox from "components/Checkbox/Checkbox";

import "./ClaimEsUnity.css";

import bscIcon from "img/ic_bsc_96.svg";
import polygonIcon from "img/ic_polygon_96.svg";
import optimismIcon from "img/ic_optimism_96.svg";
import arbitrumIcon from "img/ic_arbitrum_96.svg";

import { Trans, t } from "@lingui/macro";
import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { callContract, contractFetcher } from "lib/contracts";
import { bigNumberify, formatAmount, formatAmountFree, parseValue } from "lib/numbers";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";

const VEST_WITH_UNITY_BSC = "VEST_WITH_UNITY_BSC";
const VEST_WITH_ULP_BSC = "VEST_WITH_ULP_BSC";
const VEST_WITH_UNITY_MATIC = "VEST_WITH_UNITY_MATIC";
const VEST_WITH_ULP_MATIC = "VEST_WITH_ULP_MATIC";
const VEST_WITH_UNITY_OPTIMISM = "VEST_WITH_UNITY_OPTIMISM";
const VEST_WITH_ULP_OPTIMISM = "VEST_WITH_ULP_OPTIMISM";
const VEST_WITH_UNITY_ARBITRUM = "VEST_WITH_UNITY_ARBITRUM";
const VEST_WITH_ULP_ARBITRUM = "VEST_WITH_ULP_ARBITRUM";

export function getVestingDataV2(vestingInfo) {
  if (!vestingInfo || vestingInfo.length === 0) {
    return;
  }

  const keys = ["unityVester", "ulpVester"];
  const data = {};
  const propsLength = 12;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = {
      pairAmount: vestingInfo[i * propsLength],
      vestedAmount: vestingInfo[i * propsLength + 1],
      escrowedBalance: vestingInfo[i * propsLength + 2],
      claimedAmounts: vestingInfo[i * propsLength + 3],
      claimable: vestingInfo[i * propsLength + 4],
      maxVestableAmount: vestingInfo[i * propsLength + 5],
      combinedAverageStakedAmount: vestingInfo[i * propsLength + 6],
      cumulativeReward: vestingInfo[i * propsLength + 7],
      transferredCumulativeReward: vestingInfo[i * propsLength + 8],
      bonusReward: vestingInfo[i * propsLength + 9],
      averageStakedAmount: vestingInfo[i * propsLength + 10],
      transferredAverageStakedAmount: vestingInfo[i * propsLength + 11],
    };

    data[key + "PairAmount"] = data[key].pairAmount;
    data[key + "VestedAmount"] = data[key].vestedAmount;
    data[key + "EscrowedBalance"] = data[key].escrowedBalance;
    data[key + "ClaimSum"] = data[key].claimedAmounts.add(data[key].claimable);
    data[key + "Claimable"] = data[key].claimable;
    data[key + "MaxVestableAmount"] = data[key].maxVestableAmount;
    data[key + "CombinedAverageStakedAmount"] = data[key].combinedAverageStakedAmount;
    data[key + "CumulativeReward"] = data[key].cumulativeReward;
    data[key + "TransferredCumulativeReward"] = data[key].transferredCumulativeReward;
    data[key + "BonusReward"] = data[key].bonusReward;
    data[key + "AverageStakedAmount"] = data[key].averageStakedAmount;
    data[key + "TransferredAverageStakedAmount"] = data[key].transferredAverageStakedAmount;
  }

  return data;
}

function getVestingValues({ minRatio, amount, vestingDataItem }) {
  if (!vestingDataItem || !amount || amount.eq(0)) {
    return;
  }

  let currentRatio = bigNumberify(0);

  const ratioMultiplier = 10000;
  const maxVestableAmount = vestingDataItem.maxVestableAmount;
  const nextMaxVestableEsUnity = maxVestableAmount.add(amount);

  const combinedAverageStakedAmount = vestingDataItem.combinedAverageStakedAmount;
  if (maxVestableAmount.gt(0)) {
    currentRatio = combinedAverageStakedAmount.mul(ratioMultiplier).div(maxVestableAmount);
  }

  const transferredCumulativeReward = vestingDataItem.transferredCumulativeReward;
  const nextTransferredCumulativeReward = transferredCumulativeReward.add(amount);
  const cumulativeReward = vestingDataItem.cumulativeReward;
  const totalCumulativeReward = cumulativeReward.add(nextTransferredCumulativeReward);

  let nextCombinedAverageStakedAmount = combinedAverageStakedAmount;

  if (combinedAverageStakedAmount.lt(totalCumulativeReward.mul(minRatio))) {
    const averageStakedAmount = vestingDataItem.averageStakedAmount;
    let nextTransferredAverageStakedAmount = totalCumulativeReward.mul(minRatio);
    nextTransferredAverageStakedAmount = nextTransferredAverageStakedAmount.sub(
      averageStakedAmount.mul(cumulativeReward).div(totalCumulativeReward)
    );
    nextTransferredAverageStakedAmount = nextTransferredAverageStakedAmount
      .mul(totalCumulativeReward)
      .div(nextTransferredCumulativeReward);

    nextCombinedAverageStakedAmount = averageStakedAmount
      .mul(cumulativeReward)
      .div(totalCumulativeReward)
      .add(nextTransferredAverageStakedAmount.mul(nextTransferredCumulativeReward).div(totalCumulativeReward));
  }

  const nextRatio = nextCombinedAverageStakedAmount.mul(ratioMultiplier).div(nextMaxVestableEsUnity);

  const initialStakingAmount = currentRatio.mul(maxVestableAmount);
  const nextStakingAmount = nextRatio.mul(nextMaxVestableEsUnity);

  return {
    maxVestableAmount,
    currentRatio,
    nextMaxVestableEsUnity,
    nextRatio,
    initialStakingAmount,
    nextStakingAmount,
  };
}

export default function ClaimEsUnity({ setPendingTxns }) {
  const { active, account, library } = useWeb3React();
  const { chainId } = useChainId();
  const [selectedOption, setSelectedOption] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [value, setValue] = useState("");

  const isARBITRUM = chainId === ARBITRUM;

  const esUnityIouAddress = getContract(chainId, "ES_UNITY_IOU");

  const { data: esUnityIouBalance } = useSWR(
    [
      `ClaimEsUnity:esUnityIouBalance:${active}`,
      chainId,
      esUnityIouAddress,
      "balanceOf",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  // const bscRewardReaderAddress = getContract(BSC, "RewardReader");
  // const maticRewardReaderAddress = getContract(POLYGON, "RewardReader");
  // const optimismRewardReaderAddress = getContract(OPTIMISM, "RewardReader");
  const arbitrumRewardReaderAddress = getContract(ARBITRUM, "RewardReader");

  // const bscVesterAdddresses = [getContract(BSC, "UnityVester"), getContract(BSC, "UlpVester")];
  // const maticVesterAdddresses = [getContract(POLYGON, "UnityVester"), getContract(POLYGON, "UlpVester")];
  // const optimismVesterAdddresses = [getContract(OPTIMISM, "UnityVester"), getContract(OPTIMISM, "UlpVester")];
  const arbitrumVesterAdddresses = [getContract(ARBITRUM, "UnityVester"), getContract(ARBITRUM, "UlpVester")];

  // const { data: bscVestingInfo } = useSWR(
  //   [`StakeV2:vestingInfo:${active}`, BSC, bscRewardReaderAddress, "getVestingInfoV2", account || PLACEHOLDER_ACCOUNT],
  //   {
  //     fetcher: contractFetcher(undefined, RewardReader, [bscVesterAdddresses]),
  //   }
  // );

  // const { data: maticVestingInfo } = useSWR(
  //   [
  //     `StakeV2:vestingInfo:${active}`,
  //     POLYGON,
  //     maticRewardReaderAddress,
  //     "getVestingInfoV2",
  //     account || PLACEHOLDER_ACCOUNT,
  //   ],
  //   {
  //     fetcher: contractFetcher(undefined, RewardReader, [maticVesterAdddresses]),
  //   }
  // );

  // const { data: optimismVestingInfo } = useSWR(
  //   [
  //     `StakeV2:vestingInfo:${active}`,
  //     OPTIMISM,
  //     optimismRewardReaderAddress,
  //     "getVestingInfoV2",
  //     account || PLACEHOLDER_ACCOUNT,
  //   ],
  //   {
  //     fetcher: contractFetcher(undefined, RewardReader, [optimismVesterAdddresses]),
  //   }
  // );

  const { data: arbitrumVestingInfo } = useSWR(
    [
      `StakeV2:vestingInfo:${active}`,
      ARBITRUM,
      arbitrumRewardReaderAddress,
      "getVestingInfoV2",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(undefined, RewardReader, [arbitrumVesterAdddresses]),
    }
  );

  // const bscVestingData = getVestingDataV2(bscVestingInfo);
  // const maticVestingData = getVestingDataV2(maticVestingInfo);
  // const optimismVestingData = getVestingDataV2(optimismVestingInfo);
  const arbitrumVestingData = getVestingDataV2(arbitrumVestingInfo);

  let amount = parseValue(value, 18);

  let maxVestableAmount;
  let currentRatio;

  let nextMaxVestableEsUnity;
  let nextRatio;

  let initialStakingAmount;
  let nextStakingAmount;

  let stakingToken = "staked UNITY";

  const shouldShowStakingAmounts = false;

  // if (selectedOption === VEST_WITH_UNITY_BSC && bscVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(4),
  //     amount,
  //     vestingDataItem: bscVestingData.unityVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }
  // }

  // if (selectedOption === VEST_WITH_ULP_BSC && bscVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(320),
  //     amount,
  //     vestingDataItem: bscVestingData.ulpVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }

  //   stakingToken = "$ULP";
  // }

  // if (selectedOption === VEST_WITH_UNITY_MATIC && maticVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(4),
  //     amount,
  //     vestingDataItem: maticVestingData.unityVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }
  // }

  // if (selectedOption === VEST_WITH_ULP_MATIC && maticVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(320),
  //     amount,
  //     vestingDataItem: maticVestingData.ulpVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }

  //   stakingToken = "$ULP";
  // }

  // if (selectedOption === VEST_WITH_UNITY_OPTIMISM && optimismVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(4),
  //     amount,
  //     vestingDataItem: optimismVestingData.unityVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }
  // }

  // if (selectedOption === VEST_WITH_ULP_OPTIMISM && optimismVestingData) {
  //   const result = getVestingValues({
  //     minRatio: bigNumberify(320),
  //     amount,
  //     vestingDataItem: optimismVestingData.ulpVester,
  //   });

  //   if (result) {
  //     ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
  //       result);
  //   }

  //   stakingToken = "$ULP";
  // }

  if (selectedOption === VEST_WITH_UNITY_ARBITRUM && arbitrumVestingData) {
    const result = getVestingValues({
      minRatio: bigNumberify(4),
      amount,
      vestingDataItem: arbitrumVestingData.unityVester,
    });

    if (result) {
      ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
        result);
    }
  }

  if (selectedOption === VEST_WITH_ULP_ARBITRUM && arbitrumVestingData) {
    const result = getVestingValues({
      minRatio: bigNumberify(320),
      amount,
      vestingDataItem: arbitrumVestingData.ulpVester,
    });

    if (result) {
      ({ maxVestableAmount, currentRatio, nextMaxVestableEsUnity, nextRatio, initialStakingAmount, nextStakingAmount } =
        result);
    }

    stakingToken = "$ULP";
  }

  const getError = () => {
    if (!active) {
      return t`Wallet not connected`;
    }

    if (esUnityIouBalance && esUnityIouBalance.eq(0)) {
      return t`No esUNITY to claim`;
    }

    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }

    if (selectedOption === "") {
      return t`Select an option`;
    }

    return false;
  };

  const error = getError();

  const getPrimaryText = () => {
    if (error) {
      return error;
    }

    if (isClaiming) {
      return t`Claiming...`;
    }

    return t`Claim`;
  };

  const isPrimaryEnabled = () => {
    return !error && !isClaiming;
  };

  const claim = () => {
    setIsClaiming(true);

    let receiver;

    // if (selectedOption === VEST_WITH_UNITY_BSC) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    // if (selectedOption === VEST_WITH_ULP_BSC) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    // if (selectedOption === VEST_WITH_UNITY_MATIC) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    // if (selectedOption === VEST_WITH_ULP_MATIC) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    // if (selectedOption === VEST_WITH_UNITY_OPTIMISM) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    // if (selectedOption === VEST_WITH_ULP_OPTIMISM) {
    //   receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    // }

    if (selectedOption === VEST_WITH_UNITY_ARBITRUM) {
      receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    }

    if (selectedOption === VEST_WITH_ULP_ARBITRUM) {
      receiver = "0x0524af1B20a7F1c02A06CB73c8Ee15030B39F10e";
    }

    const contract = new ethers.Contract(esUnityIouAddress, Token.abi, library.getSigner());
    callContract(chainId, contract, "transfer", [receiver, amount], {
      sentMsg: t`Claim submitted!`,
      failMsg: t`Claim failed.`,
      successMsg: t`Claim completed!`,
      setPendingTxns,
    })
      .then(async (res) => {})
      .finally(() => {
        setIsClaiming(false);
      });
  };

  return (
    <div className="ClaimEsUnity Page page-layout">
      <div className="Page-title-section mt-0">
        <div className="Page-title">
          <Trans>Claim esUNITY</Trans>
        </div>
        {!isARBITRUM && (
          <div className="Page-description">
            <br />
            <Trans>Please switch your network to ARBITRUM.</Trans>
          </div>
        )}
        {isARBITRUM && (
          <div>
            <div className="Page-description">
              <br />
              <Trans>You have {formatAmount(esUnityIouBalance, 18, 2, true)} esUNITY (IOU) tokens.</Trans>
              <br />
              <br />
              <Trans>The address of the esUNITY (IOU) token is {esUnityIouAddress}.</Trans>
              <br />
              <Trans>
                The esUNITY (IOU) token is transferrable. You can add the token to your wallet and send it to another
                address to claim if you'd like.
              </Trans>
              <br />
              <br />
              <Trans>Select your vesting option below then click "Claim".</Trans>
              <br />
              <Trans>
                After claiming, the esUNITY tokens will be airdropped to your account on the selected network within 7
                days.
              </Trans>
              <br />
              <Trans>The esUNITY tokens can be staked or vested at any time.</Trans>
              <br />
              <Trans>
                Your esUNITY (IOU) balance will decrease by your claim amount after claiming, this is expected
                behaviour.
              </Trans>
              <br />
              <Trans>
                You can check your claim history{" "}
                <ExternalLink href={`https://arbiscan.io/token/${esUnityIouAddress}?a=${account}`}>here</ExternalLink>.
              </Trans>
            </div>
            <br />
            <div className="ClaimEsUnity-vesting-options">
              {/* <Checkbox
                className="bsc btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_UNITY_BSC}
                setIsChecked={() => setSelectedOption(VEST_WITH_UNITY_BSC)}
              >
                <div className="ClaimEsUnity-option-label">
                  <Trans>Vest with $UNITY on Bsc</Trans>
                </div>
                <img src={bscIcon} alt="Bsc" width="96px" />
              </Checkbox>
              <Checkbox
                className="bsc btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_ULP_BSC}
                setIsChecked={() => setSelectedOption(VEST_WITH_ULP_BSC)}
              >
                <div className="ClaimEsUnity-option-label">
                  <Trans>Vest with $ULP on Bsc</Trans>
                </div>
                <img src={bscIcon} alt="Bsc" />
              </Checkbox>
              <Checkbox
                className="polygon btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_UNITY_MATIC}
                setIsChecked={() => setSelectedOption(VEST_WITH_UNITY_MATIC)}
              >
                <div className="ClaimEsUnity-option-label">
                  <Trans>Vest with $UNITY on Polygon</Trans>
                </div>
                <img src={polygonIcon} alt="Polygon" />
              </Checkbox>
              <Checkbox
                className="polygon btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_ULP_MATIC}
                setIsChecked={() => setSelectedOption(VEST_WITH_ULP_MATIC)}
              >
                <div className="ClaimEsUnity-option-label polygon">
                  <Trans>Vest with $ULP on Polygon</Trans>
                </div>
                <img src={polygonIcon} alt="Polygon" />
              </Checkbox>
              <Checkbox
                className="optimism btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_UNITY_OPTIMISM}
                setIsChecked={() => setSelectedOption(VEST_WITH_UNITY_OPTIMISM)}
              >
                <div className="ClaimEsUnity-option-label">
                  <Trans>Vest with $UNITY on Optimism</Trans>
                </div>
                <img src={optimismIcon} alt="Optimism" />
              </Checkbox>
              <Checkbox
                className="optimism btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_ULP_OPTIMISM}
                setIsChecked={() => setSelectedOption(VEST_WITH_ULP_OPTIMISM)}
              >
                <div className="ClaimEsUnity-option-label optimism">
                  <Trans>Vest with $ULP on Optimism</Trans>
                </div>
                <img src={optimismIcon} alt="Optimism" />
              </Checkbox> */}
              <Checkbox
                className="arbitrum btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_UNITY_ARBITRUM}
                setIsChecked={() => setSelectedOption(VEST_WITH_UNITY_ARBITRUM)}
              >
                <div className="ClaimEsUnity-option-label">
                  <Trans>Vest with $UNITY on Arbitrum</Trans>
                </div>
                <img src={arbitrumIcon} alt="arbitrum" />
              </Checkbox>
              <Checkbox
                className="arbitrum btn btn-primary btn-left btn-lg"
                isChecked={selectedOption === VEST_WITH_ULP_ARBITRUM}
                setIsChecked={() => setSelectedOption(VEST_WITH_ULP_ARBITRUM)}
              >
                <div className="ClaimEsUnity-option-label arbitrum">
                  <Trans>Vest with $ULP on Arbitrum</Trans>
                </div>
                <img src={arbitrumIcon} alt="arbitrum" />
              </Checkbox>
            </div>
            <br />
            {!error && (
              <div className="muted">
                <Trans>
                  You can currently vest a maximum of {formatAmount(maxVestableAmount, 18, 2, true)} esUNITY tokens at a
                  ratio of {formatAmount(currentRatio, 4, 2, true)} {stakingToken} to 1 esUNITY.
                </Trans>
                {shouldShowStakingAmounts && `${formatAmount(initialStakingAmount, 18, 2, true)}.`}
                <br />
                <Trans>
                  After claiming you will be able to vest a maximum of{" "}
                  {formatAmount(nextMaxVestableEsUnity, 18, 2, true)} esUNITY at a ratio of{" "}
                  {formatAmount(nextRatio, 4, 2, true)} {stakingToken} to 1 esUNITY.
                </Trans>
                {shouldShowStakingAmounts && `${formatAmount(nextStakingAmount, 18, 2, true)}.`}
                <br />
                <br />
              </div>
            )}
            <div>
              <div className="ClaimEsUnity-input-label muted">
                <Trans>Amount to claim</Trans>
              </div>
              <div className="ClaimEsUnity-input-container">
                <input type="number" placeholder="0.0" value={value} onChange={(e) => setValue(e.target.value)} />
                {value !== formatAmountFree(esUnityIouBalance, 18, 18) && (
                  <div
                    className="ClaimEsUnity-max-button"
                    onClick={() => setValue(formatAmountFree(esUnityIouBalance, 18, 18))}
                  >
                    <Trans>MAX</Trans>
                  </div>
                )}
              </div>
            </div>
            <br />
            <div>
              <button className="App-cta Exchange-swap-button" disabled={!isPrimaryEnabled()} onClick={() => claim()}>
                {getPrimaryText()}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
