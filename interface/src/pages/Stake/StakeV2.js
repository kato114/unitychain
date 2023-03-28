import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans, t } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";

import Modal from "components/Modal/Modal";
import Checkbox from "components/Checkbox/Checkbox";
import Tooltip from "components/Tooltip/Tooltip";
import Footer from "components/Footer/Footer";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import Vester from "abis/Vester.json";
import RewardRouter from "abis/RewardRouter.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import UlpManager from "abis/UlpManager.json";

import { ethers } from "ethers";
import {
  ULP_DECIMALS,
  USD_DECIMALS,
  BASIS_POINTS_DIVISOR,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
  getPageTitle,
} from "lib/legacy";
import { useUnityPrice, useTotalUnityStaked, useTotalUnitySupply } from "domain/legacy";
import { ARBITRUM, getChainName, getConstant } from "config/chains"; //BSC, OPTIMISM,

import useSWR from "swr";

import { getContract } from "config/contracts";

import "./StakeV2.css";
import SEO from "components/Common/SEO";
import StatsTooltip from "components/StatsTooltip/StatsTooltip";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import { getServerUrl } from "config/backend";
import { callContract, contractFetcher } from "lib/contracts";
import { useLocalStorageSerializeKey } from "lib/localStorage";
import { helperToast } from "lib/helperToast";
import { approveTokens } from "domain/tokens";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { useChainId } from "lib/chains";
import levelSymbol from "img/level_symbol.png";

const { AddressZero } = ethers.constants;

function StakeModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
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
    rewardRouterAddress,
    stakeMethodName,
    setPendingTxns,
  } = props;
  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { data: tokenAllowance } = useSWR(
    active && stakingTokenAddress && [active, chainId, stakingTokenAddress, "allowance", account, farmAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  let amount = parseValue(value, 18);
  const needApproval = farmAddress !== AddressZero && tokenAllowance && amount && amount.gt(tokenAllowance);

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
        chainId,
      });
      return;
    }

    setIsStaking(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(chainId, contract, stakeMethodName, [amount], {
      sentMsg: t`Stake submitted!`,
      failMsg: t`Stake failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
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
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    library,
    unstakingTokenSymbol,
    rewardRouterAddress,
    unstakeMethodName,
    multiplierPointsAmount,
    reservedAmount,
    bonusUnityInFeeUnity,
    setPendingTxns,
  } = props;
  const [isUnstaking, setIsUnstaking] = useState(false);

  let amount = parseValue(value, 18);
  let burnAmount;

  if (
    multiplierPointsAmount &&
    multiplierPointsAmount.gt(0) &&
    amount &&
    amount.gt(0) &&
    bonusUnityInFeeUnity &&
    bonusUnityInFeeUnity.gt(0)
  ) {
    burnAmount = multiplierPointsAmount.mul(amount).div(bonusUnityInFeeUnity);
  }

  const shouldShowReductionAmount = true;
  let rewardReductionBasisPoints;
  if (burnAmount && bonusUnityInFeeUnity) {
    rewardReductionBasisPoints = burnAmount.mul(BASIS_POINTS_DIVISOR).div(bonusUnityInFeeUnity);
  }

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
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(chainId, contract, unstakeMethodName, [amount], {
      sentMsg: t`Unstake submitted!`,
      failMsg: t`Unstake failed.`,
      successMsg: t`Unstake completed!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
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
            <div className="PositionEditor-token-symbol">{unstakingTokenSymbol}</div>
          </div>
        </div>
        {reservedAmount && reservedAmount.gt(0) && (
          <div className="Modal-note">
            You have {formatAmount(reservedAmount, 18, 2, true)} tokens reserved for vesting.
          </div>
        )}
        {burnAmount && burnAmount.gt(0) && rewardReductionBasisPoints && rewardReductionBasisPoints.gt(0) && (
          <div className="Modal-note">
            Unstaking will burn&nbsp;
            <a href="https://docs.utrade.exchange/rewards" target="_blank" rel="noopener noreferrer">
              {formatAmount(burnAmount, 18, 4, true)} Multiplier Points
            </a>
            .&nbsp;
            {shouldShowReductionAmount && (
              <span>Boost Percentage: -{formatAmount(rewardReductionBasisPoints, 2, 2)}%.</span>
            )}
          </div>
        )}
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function VesterDepositModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    balance,
    vestedAmount,
    averageStakedAmount,
    maxVestableAmount,
    library,
    stakeTokenLabel,
    reserveAmount,
    maxReserveAmount,
    vesterAddress,
    setPendingTxns,
  } = props;
  const [isDepositing, setIsDepositing] = useState(false);

  let amount = parseValue(value, 18);

  let nextReserveAmount = reserveAmount;

  let nextDepositAmount = vestedAmount;
  if (amount) {
    nextDepositAmount = vestedAmount.add(amount);
  }

  let additionalReserveAmount = bigNumberify(0);
  if (amount && averageStakedAmount && maxVestableAmount && maxVestableAmount.gt(0)) {
    nextReserveAmount = nextDepositAmount.mul(averageStakedAmount).div(maxVestableAmount);
    if (nextReserveAmount.gt(reserveAmount)) {
      additionalReserveAmount = nextReserveAmount.sub(reserveAmount);
    }
  }

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
    if (nextReserveAmount.gt(maxReserveAmount)) {
      return t`Insufficient staked tokens`;
    }
  };

  const onClickPrimary = () => {
    setIsDepositing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "deposit", [amount], {
      sentMsg: t`Deposit submitted!`,
      failMsg: t`Deposit failed!`,
      successMsg: t`Deposited!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsDepositing(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isDepositing) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isDepositing) {
      return t`Depositing...`;
    }
    return t`Deposit`;
  };

  return (
    <SEO title={getPageTitle("Earn")}>
      <div className="StakeModal">
        <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title} className="non-scrollable">
          <div className="Exchange-swap-section">
            <div className="Exchange-swap-section-top">
              <div className="muted">
                <div className="Exchange-swap-usd">
                  <Trans>Deposit</Trans>
                </div>
              </div>
              <div
                className="muted align-right clickable"
                onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}
              >
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
              <div className="PositionEditor-token-symbol">esUNITY</div>
            </div>
          </div>
          <div className="VesterDepositModal-info-rows">
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Wallet</Trans>
              </div>
              <div className="align-right">{formatAmount(balance, 18, 2, true)} esUNITY</div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Vault Capacity</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(nextDepositAmount, 18, 2, true)} / ${formatAmount(
                    maxVestableAmount,
                    18,
                    2,
                    true
                  )}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <div>
                        <p className="text-white">
                          <Trans>Vault Capacity for your Account:</Trans>
                        </p>
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Deposited`}
                          value={`${formatAmount(vestedAmount, 18, 2, true)} esUNITY`}
                        />
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Max Capacity`}
                          value={`${formatAmount(maxVestableAmount, 18, 2, true)} esUNITY`}
                        />
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Reserve Amount</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(
                    reserveAmount && reserveAmount.gte(additionalReserveAmount)
                      ? reserveAmount
                      : additionalReserveAmount,
                    18,
                    2,
                    true
                  )} / ${formatAmount(maxReserveAmount, 18, 2, true)}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <>
                        <StatsTooltipRow
                          label={t`Current Reserved`}
                          value={formatAmount(reserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        <StatsTooltipRow
                          label={t`Additional reserve required`}
                          value={formatAmount(additionalReserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        {amount && nextReserveAmount.gt(maxReserveAmount) && (
                          <>
                            <br />
                            <Trans>
                              You need a total of at least {formatAmount(nextReserveAmount, 18, 2, true)}{" "}
                              {stakeTokenLabel} to vest {formatAmount(amount, 18, 2, true)} esUNITY.
                            </Trans>
                          </>
                        )}
                      </>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="Exchange-swap-button-container">
            <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
              {getPrimaryText()}
            </button>
          </div>
        </Modal>
      </div>
    </SEO>
  );
}

function VesterWithdrawModal(props) {
  const { isVisible, setIsVisible, chainId, title, library, vesterAddress, setPendingTxns } = props;
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const onClickPrimary = () => {
    setIsWithdrawing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "withdraw", [], {
      sentMsg: t`Withdraw submitted.`,
      failMsg: t`Withdraw failed.`,
      successMsg: t`Withdrawn!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsWithdrawing(false);
      });
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <Trans>
          <div>
            This will withdraw and unreserve all tokens as well as pause vesting.
            <br />
            <br />
            esUNITY tokens that have been converted to $UNITY will remain as $UNITY tokens.
            <br />
            <br />
            To claim $UNITY tokens without withdrawing, use the "Claim" button under the Total Rewards section.
            <br />
            <br />
          </div>
        </Trans>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={isWithdrawing}>
            {!isWithdrawing && "Confirm Withdraw"}
            {isWithdrawing && "Confirming..."}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function CompoundModal(props) {
  const {
    isVisible,
    setIsVisible,
    rewardRouterAddress,
    active,
    account,
    library,
    chainId,
    setPendingTxns,
    totalVesterRewards,
    nativeTokenSymbol,
    wrappedTokenSymbol,
  } = props;
  const [isCompounding, setIsCompounding] = useState(false);
  const [shouldClaimUnity, setShouldClaimUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-claim-unity"],
    true
  );
  const [shouldStakeUnity, setShouldStakeUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-stake-unity"],
    true
  );
  const [shouldClaimEsUnity, setShouldClaimEsUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-claim-es-unity"],
    true
  );
  const [shouldStakeEsUnity, setShouldStakeEsUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-stake-es-unity"],
    true
  );
  const [shouldStakeMultiplierPoints, setShouldStakeMultiplierPoints] = useState(true);
  const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-claim-weth"],
    true
  );
  const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-compound-should-convert-weth"],
    true
  );

  const unityAddress = getContract(chainId, "UNITY");
  const stakedUnityTrackerAddress = getContract(chainId, "StakedUnityTracker");

  const [isApproving, setIsApproving] = useState(false);

  const { data: tokenAllowance } = useSWR(
    active && [active, chainId, unityAddress, "allowance", account, stakedUnityTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const needApproval =
    shouldStakeUnity && tokenAllowance && totalVesterRewards && totalVesterRewards.gt(tokenAllowance);

  const isPrimaryEnabled = () => {
    return !isCompounding && !isApproving && !isCompounding;
  };

  const getPrimaryText = () => {
    if (isApproving) {
      return t`Approving $UNITY...`;
    }
    if (needApproval) {
      return t`Approve $UNITY`;
    }
    if (isCompounding) {
      return t`Compounding...`;
    }
    return t`Compound`;
  };

  const onClickPrimary = () => {
    if (needApproval) {
      approveTokens({
        setIsApproving,
        library,
        tokenAddress: unityAddress,
        spender: stakedUnityTrackerAddress,
        chainId,
      });
      return;
    }

    setIsCompounding(true);

    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(
      chainId,
      contract,
      "handleRewards",
      [
        shouldClaimUnity || shouldStakeUnity,
        shouldStakeUnity,
        shouldClaimEsUnity || shouldStakeEsUnity,
        shouldStakeEsUnity,
        shouldStakeMultiplierPoints,
        shouldClaimWeth || shouldConvertWeth,
        shouldConvertWeth,
      ],
      {
        sentMsg: t`Compound submitted!`,
        failMsg: t`Compound failed.`,
        successMsg: t`Compound completed!`,
        setPendingTxns,
      }
    )
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsCompounding(false);
      });
  };

  const toggleShouldStakeUnity = (value) => {
    if (value) {
      setShouldClaimUnity(true);
    }
    setShouldStakeUnity(value);
  };

  const toggleShouldStakeEsUnity = (value) => {
    if (value) {
      setShouldClaimEsUnity(true);
    }
    setShouldStakeEsUnity(value);
  };

  const toggleConvertWeth = (value) => {
    if (value) {
      setShouldClaimWeth(true);
    }
    setShouldConvertWeth(value);
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={t`Compound Rewards`}>
        <div className="CompoundModal-menu">
          <div>
            <Checkbox
              isChecked={shouldStakeMultiplierPoints}
              setIsChecked={setShouldStakeMultiplierPoints}
              disabled={true}
            >
              <Trans>Stake Multiplier Points</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldClaimUnity} setIsChecked={setShouldClaimUnity} disabled={shouldStakeUnity}>
              <Trans>Claim $UNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldStakeUnity} setIsChecked={toggleShouldStakeUnity}>
              <Trans>Stake $UNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldClaimEsUnity} setIsChecked={setShouldClaimEsUnity} disabled={shouldStakeEsUnity}>
              <Trans>Claim esUNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldStakeEsUnity} setIsChecked={toggleShouldStakeEsUnity}>
              <Trans>Stake esUNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
              <Trans>Claim {wrappedTokenSymbol} Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
              <Trans>
                Convert {wrappedTokenSymbol} to {nativeTokenSymbol}
              </Trans>
            </Checkbox>
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

function ClaimModal(props) {
  const {
    isVisible,
    setIsVisible,
    rewardRouterAddress,
    library,
    chainId,
    setPendingTxns,
    nativeTokenSymbol,
    wrappedTokenSymbol,
  } = props;
  const [isClaiming, setIsClaiming] = useState(false);
  const [shouldClaimUnity, setShouldClaimUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-unity"],
    true
  );
  const [shouldClaimEsUnity, setShouldClaimEsUnity] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-es-unity"],
    true
  );
  const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-weth"],
    true
  );
  const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-convert-weth"],
    true
  );

  const isPrimaryEnabled = () => {
    return !isClaiming;
  };

  const getPrimaryText = () => {
    if (isClaiming) {
      return t`Claiming...`;
    }
    return t`Claim`;
  };

  const onClickPrimary = () => {
    setIsClaiming(true);

    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(
      chainId,
      contract,
      "handleRewards",
      [
        shouldClaimUnity,
        false, // shouldStakeUnity
        shouldClaimEsUnity,
        false, // shouldStakeEsUnity
        false, // shouldStakeMultiplierPoints
        shouldClaimWeth,
        shouldConvertWeth,
      ],
      {
        sentMsg: t`Claim submitted.`,
        failMsg: t`Claim failed.`,
        successMsg: t`Claim completed!`,
        setPendingTxns,
      }
    )
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  const toggleConvertWeth = (value) => {
    if (value) {
      setShouldClaimWeth(true);
    }
    setShouldConvertWeth(value);
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={t`Claim Rewards`}>
        <div className="CompoundModal-menu">
          <div>
            <Checkbox isChecked={shouldClaimUnity} setIsChecked={setShouldClaimUnity}>
              <Trans>Claim $UNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldClaimEsUnity} setIsChecked={setShouldClaimEsUnity}>
              <Trans>Claim esUNITY Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
              <Trans>Claim {wrappedTokenSymbol} Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
              <Trans>
                Convert {wrappedTokenSymbol} to {nativeTokenSymbol}
              </Trans>
            </Checkbox>
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

export default function StakeV2({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const chainName = getChainName(chainId);

  const hasInsurance = true;

  const [isStakeModalVisible, setIsStakeModalVisible] = useState(false);
  const [stakeModalTitle, setStakeModalTitle] = useState("");
  const [stakeModalMaxAmount, setStakeModalMaxAmount] = useState(undefined);
  const [stakeValue, setStakeValue] = useState("");
  const [stakingTokenSymbol, setStakingTokenSymbol] = useState("");
  const [stakingTokenAddress, setStakingTokenAddress] = useState("");
  const [stakingFarmAddress, setStakingFarmAddress] = useState("");
  const [stakeMethodName, setStakeMethodName] = useState("");

  const [isUnstakeModalVisible, setIsUnstakeModalVisible] = useState(false);
  const [unstakeModalTitle, setUnstakeModalTitle] = useState("");
  const [unstakeModalMaxAmount, setUnstakeModalMaxAmount] = useState(undefined);
  const [unstakeModalReservedAmount, setUnstakeModalReservedAmount] = useState(undefined);
  const [unstakeValue, setUnstakeValue] = useState("");
  const [unstakingTokenSymbol, setUnstakingTokenSymbol] = useState("");
  const [unstakeMethodName, setUnstakeMethodName] = useState("");

  const [isVesterDepositModalVisible, setIsVesterDepositModalVisible] = useState(false);
  const [vesterDepositTitle, setVesterDepositTitle] = useState("");
  const [vesterDepositStakeTokenLabel, setVesterDepositStakeTokenLabel] = useState("");
  const [vesterDepositMaxAmount, setVesterDepositMaxAmount] = useState("");
  const [vesterDepositBalance, setVesterDepositBalance] = useState("");
  const [vesterDepositEscrowedBalance, setVesterDepositEscrowedBalance] = useState("");
  const [vesterDepositVestedAmount, setVesterDepositVestedAmount] = useState("");
  const [vesterDepositAverageStakedAmount, setVesterDepositAverageStakedAmount] = useState("");
  const [vesterDepositMaxVestableAmount, setVesterDepositMaxVestableAmount] = useState("");
  const [vesterDepositValue, setVesterDepositValue] = useState("");
  const [vesterDepositReserveAmount, setVesterDepositReserveAmount] = useState("");
  const [vesterDepositMaxReserveAmount, setVesterDepositMaxReserveAmount] = useState("");
  const [vesterDepositAddress, setVesterDepositAddress] = useState("");

  const [isVesterWithdrawModalVisible, setIsVesterWithdrawModalVisible] = useState(false);
  const [vesterWithdrawTitle, setVesterWithdrawTitle] = useState(false);
  const [vesterWithdrawAddress, setVesterWithdrawAddress] = useState("");

  const [isCompoundModalVisible, setIsCompoundModalVisible] = useState(false);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);

  const rewardRouterAddress = getContract(chainId, "RewardRouter");
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

  const stakedUnityDistributorAddress = getContract(chainId, "StakedUnityDistributor");
  const stakedUlpDistributorAddress = getContract(chainId, "StakedUlpDistributor");

  const unityVesterAddress = getContract(chainId, "UnityVester");
  const ulpVesterAddress = getContract(chainId, "UlpVester");

  const vesterAddresses = [unityVesterAddress, ulpVesterAddress];

  const excludedEsUnityAccounts = [stakedUnityDistributorAddress, stakedUlpDistributorAddress];

  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

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
    [
      `StakeV2:walletBalances:${active}`,
      chainId,
      readerAddress,
      "getTokenBalancesWithSupplies",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, ReaderV2, [walletTokens]),
    }
  );
  const { data: depositBalances } = useSWR(
    [
      `StakeV2:depositBalances:${active}`,
      chainId,
      rewardReaderAddress,
      "getDepositBalances",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
    }
  );

  const { data: stakingInfo } = useSWR(
    [`StakeV2:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
    }
  );

  const { data: stakedUnitySupply } = useSWR(
    [`StakeV2:stakedUnitySupply:${active}`, chainId, unityAddress, "balanceOf", stakedUnityTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, ulpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, UlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: contractFetcher(library, Vault),
    }
  );

  const { data: esUnitySupply } = useSWR(
    [`StakeV2:esUnitySupply:${active}`, chainId, readerAddress, "getTokenSupply", esUnityAddress],
    {
      fetcher: contractFetcher(library, ReaderV2, [excludedEsUnityAccounts]),
    }
  );
  const { data: vestingInfo } = useSWR(
    [`StakeV2:vestingInfo:${active}`, chainId, readerAddress, "getVestingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, ReaderV2, [vesterAddresses]),
    }
  );

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

  let { total: totalUnitySupply } = useTotalUnitySupply(chainId);

  let {
    matic: maticUnityStaked,
    bsc: bscUnityStaked,
    optimism: optimismUnityStaked,
    arbitrum: arbitrumUnityStaked,
    total: totalUnityStaked,
  } = useTotalUnityStaked();

  // const unitySupplyUrl = getServerUrl(chainId, "/unity_supply");
  // const { data: unitySupply } = useSWR([unitySupplyUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });
  console.log("kato chainId", chainId);
  const { data: unitySupply } = useSWR([`StakeV2:unitySupply:${active}`, chainId, unityAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, Token),
  });

  const isUnityTransferEnabled = true;

  let esUnitySupplyUsd;
  if (esUnitySupply && unityPrice) {
    esUnitySupplyUsd = esUnitySupply.mul(unityPrice).div(expandDecimals(1, 18));
  }

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

  let hasMultiplierPoints = false;
  let multiplierPointsAmount;
  if (processedData && processedData.bonusUnityTrackerRewards && processedData.bnUnityInFeeUnity) {
    multiplierPointsAmount = processedData.bonusUnityTrackerRewards.add(processedData.bnUnityInFeeUnity);
    if (multiplierPointsAmount.gt(0)) {
      hasMultiplierPoints = true;
    }
  }
  let totalRewardTokens;
  if (processedData && processedData.bnUnityInFeeUnity && processedData.bonusUnityInFeeUnity) {
    totalRewardTokens = processedData.bnUnityInFeeUnity.add(processedData.bonusUnityInFeeUnity);
  }

  let totalRewardTokensAndUlp;
  if (totalRewardTokens && processedData && processedData.ulpBalance) {
    totalRewardTokensAndUlp = totalRewardTokens.add(processedData.ulpBalance);
  }

  const bonusUnityInFeeUnity = processedData ? processedData.bonusUnityInFeeUnity : undefined;

  let stakedUnitySupplyUsd;
  if (!totalUnityStaked?.isZero() && unityPrice) {
    stakedUnitySupplyUsd = totalUnityStaked?.mul(unityPrice).div(expandDecimals(1, 18));
  }

  let totalSupplyUsd;
  if (totalUnitySupply && !totalUnitySupply.isZero() && unityPrice) {
    totalSupplyUsd = totalUnitySupply.mul(unityPrice).div(expandDecimals(1, 18));
  }

  let maxUnstakeableUnity = bigNumberify(0);
  if (
    totalRewardTokens &&
    vestingData &&
    vestingData.unityVesterPairAmount &&
    multiplierPointsAmount &&
    processedData.bonusUnityInFeeUnity
  ) {
    const availableTokens = totalRewardTokens.sub(vestingData.unityVesterPairAmount);
    const stakedTokens = processedData.bonusUnityInFeeUnity;
    const divisor = multiplierPointsAmount.add(stakedTokens);
    if (divisor.gt(0)) {
      maxUnstakeableUnity = availableTokens.mul(stakedTokens).div(divisor);
    }
  }

  const showStakeUnityModal = () => {
    if (!isUnityTransferEnabled) {
      helperToast.error(t`$UNITY transfers not yet enabled`);
      return;
    }

    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake $UNITY`);
    setStakeModalMaxAmount(processedData.unityBalance);
    setStakeValue("");
    setStakingTokenSymbol("$UNITY");
    setStakingTokenAddress(unityAddress);
    setStakingFarmAddress(stakedUnityTrackerAddress);
    setStakeMethodName("stakeUnity");
  };

  const showStakeEsUnityModal = () => {
    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake esUNITY`);
    setStakeModalMaxAmount(processedData.esUnityBalance);
    setStakeValue("");
    setStakingTokenSymbol("esUNITY");
    setStakingTokenAddress(esUnityAddress);
    setStakingFarmAddress(AddressZero);
    setStakeMethodName("stakeEsUnity");
  };

  const showUnityVesterDepositModal = () => {
    let remainingVestableAmount = vestingData.unityVester.maxVestableAmount.sub(vestingData.unityVester.vestedAmount);
    if (processedData.esUnityBalance.lt(remainingVestableAmount)) {
      remainingVestableAmount = processedData.esUnityBalance;
    }

    setIsVesterDepositModalVisible(true);
    setVesterDepositTitle(t`$UNITY Vault`);
    setVesterDepositStakeTokenLabel("staked $UNITY + esUNITY + Multiplier Points");
    setVesterDepositMaxAmount(remainingVestableAmount);
    setVesterDepositBalance(processedData.esUnityBalance);
    setVesterDepositEscrowedBalance(vestingData.unityVester.escrowedBalance);
    setVesterDepositVestedAmount(vestingData.unityVester.vestedAmount);
    setVesterDepositMaxVestableAmount(vestingData.unityVester.maxVestableAmount);
    setVesterDepositAverageStakedAmount(vestingData.unityVester.averageStakedAmount);
    setVesterDepositReserveAmount(vestingData.unityVester.pairAmount);
    setVesterDepositMaxReserveAmount(totalRewardTokens);
    setVesterDepositValue("");
    setVesterDepositAddress(unityVesterAddress);
  };

  const showUlpVesterDepositModal = () => {
    let remainingVestableAmount = vestingData.ulpVester.maxVestableAmount.sub(vestingData.ulpVester.vestedAmount);
    if (processedData.esUnityBalance.lt(remainingVestableAmount)) {
      remainingVestableAmount = processedData.esUnityBalance;
    }

    setIsVesterDepositModalVisible(true);
    setVesterDepositTitle(t`$ULP Vault`);
    setVesterDepositStakeTokenLabel("staked $ULP");
    setVesterDepositMaxAmount(remainingVestableAmount);
    setVesterDepositBalance(processedData.esUnityBalance);
    setVesterDepositEscrowedBalance(vestingData.ulpVester.escrowedBalance);
    setVesterDepositVestedAmount(vestingData.ulpVester.vestedAmount);
    setVesterDepositMaxVestableAmount(vestingData.ulpVester.maxVestableAmount);
    setVesterDepositAverageStakedAmount(vestingData.ulpVester.averageStakedAmount);
    setVesterDepositReserveAmount(vestingData.ulpVester.pairAmount);
    setVesterDepositMaxReserveAmount(processedData.ulpBalance);
    setVesterDepositValue("");
    setVesterDepositAddress(ulpVesterAddress);
  };

  const showUnityVesterWithdrawModal = () => {
    if (!vestingData || !vestingData.unityVesterVestedAmount || vestingData.unityVesterVestedAmount.eq(0)) {
      helperToast.error(t`You have not deposited any tokens for vesting.`);
      return;
    }

    setIsVesterWithdrawModalVisible(true);
    setVesterWithdrawTitle(t`Withdraw from $UNITY Vault`);
    setVesterWithdrawAddress(unityVesterAddress);
  };

  const showUlpVesterWithdrawModal = () => {
    if (!vestingData || !vestingData.ulpVesterVestedAmount || vestingData.ulpVesterVestedAmount.eq(0)) {
      helperToast.error(t`You have not deposited any tokens for vesting.`);
      return;
    }

    setIsVesterWithdrawModalVisible(true);
    setVesterWithdrawTitle(t`Withdraw from $ULP Vault`);
    setVesterWithdrawAddress(ulpVesterAddress);
  };

  const showUnstakeUnityModal = () => {
    if (!isUnityTransferEnabled) {
      helperToast.error(t`$UNITY transfers not yet enabled`);
      return;
    }
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle(t`Unstake $UNITY`);
    let maxAmount = processedData.unityInStakedUnity;
    if (
      processedData.unityInStakedUnity &&
      vestingData &&
      vestingData.unityVesterPairAmount.gt(0) &&
      maxUnstakeableUnity &&
      maxUnstakeableUnity.lt(processedData.unityInStakedUnity)
    ) {
      maxAmount = maxUnstakeableUnity;
    }
    setUnstakeModalMaxAmount(maxAmount);
    setUnstakeModalReservedAmount(vestingData.unityVesterPairAmount);
    setUnstakeValue("");
    setUnstakingTokenSymbol("$UNITY");
    setUnstakeMethodName("unstakeUnity");
  };

  const showUnstakeEsUnityModal = () => {
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle(t`Unstake esUNITY`);
    let maxAmount = processedData.esUnityInStakedUnity;
    if (
      processedData.esUnityInStakedUnity &&
      vestingData &&
      vestingData.unityVesterPairAmount.gt(0) &&
      maxUnstakeableUnity &&
      maxUnstakeableUnity.lt(processedData.esUnityInStakedUnity)
    ) {
      maxAmount = maxUnstakeableUnity;
    }
    setUnstakeModalMaxAmount(maxAmount);
    setUnstakeModalReservedAmount(vestingData.unityVesterPairAmount);
    setUnstakeValue("");
    setUnstakingTokenSymbol("esUNITY");
    setUnstakeMethodName("unstakeEsUnity");
  };

  const renderMultiplierPointsLabel = useCallback(() => {
    return t`Multiplier Points APR`;
  }, []);

  const renderMultiplierPointsValue = useCallback(() => {
    return (
      <Tooltip
        handle={`100.00%`}
        position="right-bottom"
        renderContent={() => {
          return (
            <Trans>
              Boost your rewards with Multiplier Points.&nbsp;
              <a href="https://docs.utrade.exchange/rewards#multiplier-points" rel="noreferrer" target="_blank">
                More info
              </a>
              .
            </Trans>
          );
        }}
      />
    );
  }, []);

  let earnMsg;
  if (totalRewardTokensAndUlp && totalRewardTokensAndUlp.gt(0)) {
    let unityAmountStr;
    if (processedData.unityInStakedUnity && processedData.unityInStakedUnity.gt(0)) {
      unityAmountStr = formatAmount(processedData.unityInStakedUnity, 18, 2, true) + " $UNITY";
    }
    let esUnityAmountStr;
    if (processedData.esUnityInStakedUnity && processedData.esUnityInStakedUnity.gt(0)) {
      esUnityAmountStr = formatAmount(processedData.esUnityInStakedUnity, 18, 2, true) + " esUNITY";
    }
    let mpAmountStr;
    if (processedData.bonusUnityInFeeUnity && processedData.bnUnityInFeeUnity.gt(0)) {
      mpAmountStr = formatAmount(processedData.bnUnityInFeeUnity, 18, 2, true) + " MP";
    }
    let ulpStr;
    if (processedData.ulpBalance && processedData.ulpBalance.gt(0)) {
      ulpStr = formatAmount(processedData.ulpBalance, 18, 2, true) + " $ULP";
    }
    const amountStr = [unityAmountStr, esUnityAmountStr, mpAmountStr, ulpStr].filter((s) => s).join(", ");
    earnMsg = (
      <div>
        <Trans>
          You are earning {nativeTokenSymbol} rewards with {formatAmount(totalRewardTokensAndUlp, 18, 2, true)} tokens.
          <br />
          Tokens: {amountStr}.
        </Trans>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="default-container">
        <StakeModal
          isVisible={isStakeModalVisible}
          setIsVisible={setIsStakeModalVisible}
          chainId={chainId}
          title={stakeModalTitle}
          maxAmount={stakeModalMaxAmount}
          value={stakeValue}
          setValue={setStakeValue}
          active={active}
          account={account}
          library={library}
          stakingTokenSymbol={stakingTokenSymbol}
          stakingTokenAddress={stakingTokenAddress}
          farmAddress={stakingFarmAddress}
          rewardRouterAddress={rewardRouterAddress}
          stakeMethodName={stakeMethodName}
          hasMultiplierPoints={hasMultiplierPoints}
          setPendingTxns={setPendingTxns}
          nativeTokenSymbol={nativeTokenSymbol}
          wrappedTokenSymbol={wrappedTokenSymbol}
        />
        <UnstakeModal
          setPendingTxns={setPendingTxns}
          isVisible={isUnstakeModalVisible}
          setIsVisible={setIsUnstakeModalVisible}
          chainId={chainId}
          title={unstakeModalTitle}
          maxAmount={unstakeModalMaxAmount}
          reservedAmount={unstakeModalReservedAmount}
          value={unstakeValue}
          setValue={setUnstakeValue}
          library={library}
          unstakingTokenSymbol={unstakingTokenSymbol}
          rewardRouterAddress={rewardRouterAddress}
          unstakeMethodName={unstakeMethodName}
          multiplierPointsAmount={multiplierPointsAmount}
          bonusUnityInFeeUnity={bonusUnityInFeeUnity}
        />
        <VesterDepositModal
          isVisible={isVesterDepositModalVisible}
          setIsVisible={setIsVesterDepositModalVisible}
          chainId={chainId}
          title={vesterDepositTitle}
          stakeTokenLabel={vesterDepositStakeTokenLabel}
          maxAmount={vesterDepositMaxAmount}
          balance={vesterDepositBalance}
          escrowedBalance={vesterDepositEscrowedBalance}
          vestedAmount={vesterDepositVestedAmount}
          averageStakedAmount={vesterDepositAverageStakedAmount}
          maxVestableAmount={vesterDepositMaxVestableAmount}
          reserveAmount={vesterDepositReserveAmount}
          maxReserveAmount={vesterDepositMaxReserveAmount}
          value={vesterDepositValue}
          setValue={setVesterDepositValue}
          library={library}
          vesterAddress={vesterDepositAddress}
          setPendingTxns={setPendingTxns}
        />
        <VesterWithdrawModal
          isVisible={isVesterWithdrawModalVisible}
          setIsVisible={setIsVesterWithdrawModalVisible}
          vesterAddress={vesterWithdrawAddress}
          chainId={chainId}
          title={vesterWithdrawTitle}
          library={library}
          setPendingTxns={setPendingTxns}
        />
        <CompoundModal
          active={active}
          account={account}
          setPendingTxns={setPendingTxns}
          isVisible={isCompoundModalVisible}
          setIsVisible={setIsCompoundModalVisible}
          rewardRouterAddress={rewardRouterAddress}
          totalVesterRewards={processedData.totalVesterRewards}
          wrappedTokenSymbol={wrappedTokenSymbol}
          nativeTokenSymbol={nativeTokenSymbol}
          library={library}
          chainId={chainId}
        />
        <ClaimModal
          active={active}
          account={account}
          setPendingTxns={setPendingTxns}
          isVisible={isClaimModalVisible}
          setIsVisible={setIsClaimModalVisible}
          rewardRouterAddress={rewardRouterAddress}
          totalVesterRewards={processedData.totalVesterRewards}
          wrappedTokenSymbol={wrappedTokenSymbol}
          nativeTokenSymbol={nativeTokenSymbol}
          library={library}
          chainId={chainId}
        />
        <div className="section-title-block">
          <div className="section-title-icon">
            <img src={levelSymbol} alt="LOGO Icon" />
          </div>
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Earn</Trans>
            </div>
            <div className="Page-description">
              <Trans>Stake $UNITY and $ULP to earn rewards.</Trans>
            </div>
          </div>
        </div>
        <div className="StakeV4-content">
          <div className="App-card primary StakeV2-total-rewards-card">
            <div className="App-card-title">
              <Trans>Total Rewards - Overview</Trans>
            </div>
            <div className="App-card-content">
              <div className="App-card-row">
                <div className="label">
                  {nativeTokenSymbol} ({wrappedTokenSymbol})
                </div>
                <div>
                  {formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">$UNITY</div>
                <div>
                  {formatKeyAmount(processedData, "totalVesterRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalVesterRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Escrowed $UNITY</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "totalEsUnityRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalEsUnityRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Multiplier Points</Trans>
                </div>
                <div>{formatKeyAmount(processedData, "bonusUnityTrackerRewards", 18, 4, true)}</div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Staked Multiplier Points</Trans>
                </div>
                <div>{formatKeyAmount(processedData, "bnUnityInFeeUnity", 18, 4, true)}</div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Total</Trans>
                </div>
                <div>${formatKeyAmount(processedData, "totalRewardsUsd", USD_DECIMALS, 2, true)}</div>
              </div>
            </div>
            <div className="App-card-footer">
              {/* <div className="App-card-bottom-placeholder">
                <div className="App-card-options">
                  {active && (
                    <button className="default-btn App-card-option">
                      <Trans>Compound</Trans>
                    </button>
                  )}
                  {active && (
                    <button className="default-btn App-card-option">
                      <Trans>Claim</Trans>
                    </button>
                  )}
                  {!active && (
                    <button className="default-btn App-card-option" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div> */}
              {active && (
                <button className="default-btn" onClick={() => setIsCompoundModalVisible(true)}>
                  <Trans>Compound</Trans>
                </button>
              )}
              {active && (
                <button className="default-btn" onClick={() => setIsClaimModalVisible(true)}>
                  <Trans>Claim</Trans>
                </button>
              )}
              {!active && (
                <button className="default-btn" onClick={() => connectWallet()}>
                  <Trans>Connect Wallet</Trans>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="StakeV2-content">
          <div className="App-card StakeV2-unity-card bg-red-bottom-right">
            <div className="App-card-title">
              $UNITY Price
              <div>
                $0<span className="text-red">.00</span>
                {/* {!unityPrice && "..."}
                {unityPrice && (
                  <Tooltip
                    position="right-bottom"
                    className="nowrap"
                    handle={"$" + formatAmount(unityPrice, USD_DECIMALS, 2, true)}
                    renderContent={() => (
                      <>
                        <StatsTooltipRow
                          label={t`Price on Polygon`}
                          value={formatAmount(unityPriceFromPolygon, USD_DECIMALS, 2, true)}
                        />
                        <StatsTooltipRow
                          label={t`Price on Bsc`}
                          value={formatAmount(unityPriceFromBsc, USD_DECIMALS, 2, true)}
                        />
                        <StatsTooltipRow
                          label={t`Price on Optimism`}
                          value={formatAmount(unityPriceFromOptimism, USD_DECIMALS, 2, true)}
                        />
                        <StatsTooltipRow
                          label={t`Price on Arbitrum`}
                          value={formatAmount(unityPriceFromArbitrum, USD_DECIMALS, 2, true)}
                        />
                      </>
                    )}
                  />
                )} */}
              </div>
            </div>
            <div className="App-card-content">
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Wallet</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "unityBalance", 18, 2, true)}{" "}
                    <span className="text-red">$UNITY</span>
                    ($
                    {formatKeyAmount(processedData, "unityBalanceUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
                <div className="App-card-row m">
                  <div className="label">
                    <Trans>Staked</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "unityInStakedUnity", 18, 2, true)}{" "}
                    <span className="text-red">$UNITY</span> ($
                    {formatKeyAmount(processedData, "unityInStakedUnityUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>APR</Trans>
                  </div>
                  <div>
                    <Tooltip
                      handle={`${formatKeyAmount(processedData, "unityAprTotalWithBoost", 2, 2, true)}%`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <>
                            <StatsTooltipRow
                              label="Escrowed $UNITY APR"
                              showDollar={false}
                              value={`${formatKeyAmount(processedData, "unityAprForEsUnity", 2, 2, true)}%`}
                            />
                            {(!processedData.unityBoostAprForNativeToken ||
                              processedData.unityBoostAprForNativeToken.eq(0)) && (
                              <StatsTooltipRow
                                label={`${nativeTokenSymbol} APR`}
                                showDollar={false}
                                value={`${formatKeyAmount(processedData, "unityAprForNativeToken", 2, 2, true)}%`}
                              />
                            )}
                            {processedData.unityBoostAprForNativeToken &&
                              processedData.unityBoostAprForNativeToken.gt(0) && (
                                <div>
                                  <br />

                                  <StatsTooltipRow
                                    label={`${nativeTokenSymbol} Base APR`}
                                    showDollar={false}
                                    value={`${formatKeyAmount(processedData, "unityAprForNativeToken", 2, 2, true)}%`}
                                  />
                                  <StatsTooltipRow
                                    label={`${nativeTokenSymbol} Boosted APR`}
                                    showDollar={false}
                                    value={`${formatKeyAmount(
                                      processedData,
                                      "unityBoostAprForNativeToken",
                                      2,
                                      2,
                                      true
                                    )}%`}
                                  />
                                  <div className="Tooltip-divider" />
                                  <StatsTooltipRow
                                    label={`${nativeTokenSymbol} Total APR`}
                                    showDollar={false}
                                    value={`${formatKeyAmount(
                                      processedData,
                                      "unityAprForNativeTokenWithBoost",
                                      2,
                                      2,
                                      true
                                    )}%`}
                                  />

                                  <br />

                                  <Trans>The Boosted APR is from your staked Multiplier Points.</Trans>
                                </div>
                              )}
                            <div>
                              <br />
                              <Trans>
                                APRs are updated weekly on Wednesday and will depend on the fees collected for the week.
                              </Trans>
                            </div>
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Rewards</Trans>
                  </div>
                  <div>
                    <Tooltip
                      handle={`$${formatKeyAmount(processedData, "totalUnityRewardsUsd", USD_DECIMALS, 2, true)}`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <>
                            <StatsTooltipRow
                              label={`${nativeTokenSymbol} (${wrappedTokenSymbol})`}
                              value={`${formatKeyAmount(
                                processedData,
                                "feeUnityTrackerRewards",
                                18,
                                4
                              )} ($${formatKeyAmount(
                                processedData,
                                "feeUnityTrackerRewardsUsd",
                                USD_DECIMALS,
                                2,
                                true
                              )})`}
                              showDollar={false}
                            />
                            <StatsTooltipRow
                              label="Escrowed $UNITY"
                              value={`${formatKeyAmount(
                                processedData,
                                "stakedUnityTrackerRewards",
                                18,
                                4
                              )} ($${formatKeyAmount(
                                processedData,
                                "stakedUnityTrackerRewardsUsd",
                                USD_DECIMALS,
                                2,
                                true
                              )})`}
                              showDollar={false}
                            />
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">{renderMultiplierPointsLabel()}</div>
                  <div>{renderMultiplierPointsValue()}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Boost Percentage</Trans>
                  </div>
                  <div>
                    <Tooltip
                      handle={`${formatAmount(processedData.boostBasisPoints, 2, 2, false)}%`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <div>
                            <Trans>
                              You are earning {formatAmount(processedData.boostBasisPoints, 2, 2, false)}% more{" "}
                              {nativeTokenSymbol} rewards using{" "}
                              {formatAmount(processedData.bnUnityInFeeUnity, 18, 4, 2, true)} Staked Multiplier Points.
                            </Trans>
                            <br />
                            <br />
                            <Trans>Use the "Compound" button to stake your Multiplier Points.</Trans>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div>
                <div></div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Staked</Trans>
                  </div>
                  <div>
                    {!totalUnityStaked && "..."}
                    {formatAmount(totalUnityStaked, 18, 0, true) +
                      " $UNITY" +
                      ` ($${formatAmount(stakedUnitySupplyUsd, USD_DECIMALS, 0, true)})`}
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Supply</Trans>
                  </div>
                  {!totalUnitySupply && "..."}
                  {totalUnitySupply && (
                    <div>
                      {formatAmount(totalUnitySupply, 18, 0, true)} $UNITY ($
                      {formatAmount(totalSupplyUsd, USD_DECIMALS, 0, true)})
                    </div>
                  )}
                </div>
                <div></div>
              </div>
              <div className="App-card-options" style={{ marginTop: "30px" }}>
                <a
                  className="default-btn App-card-option"
                  href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x9C36A6726aC539066EA6572587bc658D62E59F2d"
                  target="_blank"
                >
                  <Trans>Buy $UNITY</Trans>
                </a>
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showStakeUnityModal()}>
                    <Trans>Stake</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUnstakeUnityModal()}>
                    <Trans>Unstake</Trans>
                  </button>
                )}
                {active && (
                  <Link className="default-btn App-card-option" to="/begin_account_transfer">
                    <Trans>Transfer Account</Trans>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="App-card StakeV2-ulp-card bg-yellow-bottom-right">
            <div className="App-card-title">
              $ULP Price
              <div>
                $0<span className="text-yellow">.00</span>
                {/* {formatKeyAmount(processedData, "ulpPrice", USD_DECIMALS, 2, true)} */}
              </div>
            </div>
            <div className="App-card-content">
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Wallet</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "ulpBalance", ULP_DECIMALS, 2, true)}{" "}
                    <span className="text-yellow">$ULP</span> ($
                    {formatKeyAmount(processedData, "ulpBalanceUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Staked</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "ulpBalance", ULP_DECIMALS, 2, true)}{" "}
                    <span className="text-yellow">$ULP</span> ($
                    {formatKeyAmount(processedData, "ulpBalanceUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>APR</Trans>
                  </div>
                  <div>
                    <Tooltip
                      handle={`${formatKeyAmount(processedData, "ulpAprTotal", 2, 2, true)}%`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <>
                            <StatsTooltipRow
                              label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) APR`}
                              value={`${formatKeyAmount(processedData, "ulpAprForNativeToken", 2, 2, true)}%`}
                              showDollar={false}
                            />
                            <StatsTooltipRow
                              label="Escrowed $UNITY APR"
                              value={`${formatKeyAmount(processedData, "ulpAprForEsUnity", 2, 2, true)}%`}
                              showDollar={false}
                            />
                            <br />

                            <Trans>
                              APRs are updated weekly on Wednesday and will depend on the fees collected for the week.
                            </Trans>
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Rewards</Trans>
                  </div>
                  <div>
                    <Tooltip
                      handle={`$${formatKeyAmount(processedData, "totalUlpRewardsUsd", USD_DECIMALS, 2, true)}`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <>
                            <StatsTooltipRow
                              label={`${nativeTokenSymbol} (${wrappedTokenSymbol})`}
                              value={`${formatKeyAmount(
                                processedData,
                                "feeUlpTrackerRewards",
                                18,
                                4
                              )} ($${formatKeyAmount(
                                processedData,
                                "feeUlpTrackerRewardsUsd",
                                USD_DECIMALS,
                                2,
                                true
                              )})`}
                              showDollar={false}
                            />
                            <StatsTooltipRow
                              label="Escrowed $UNITY"
                              value={`${formatKeyAmount(
                                processedData,
                                "stakedUlpTrackerRewards",
                                18,
                                4
                              )} ($${formatKeyAmount(
                                processedData,
                                "stakedUlpTrackerRewardsUsd",
                                USD_DECIMALS,
                                2,
                                true
                              )})`}
                              showDollar={false}
                            />
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Staked</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "ulpSupply", 18, 2, true)} $ULP ($
                    {formatKeyAmount(processedData, "ulpSupplyUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Supply</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "ulpSupply", 18, 2, true)} $ULP ($
                    {formatKeyAmount(processedData, "ulpSupplyUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
              </div>
              <div className="App-card-options">
                <Link className="default-btn App-card-option" to="/buy_ulp">
                  <Trans>Buy $ULP</Trans>
                </Link>
                <Link className="default-btn App-card-option" to="/buy_ulp#redeem">
                  <Trans>Sell $ULP</Trans>
                </Link>
                {/* {hasInsurance && (
                  <a
                    className="default-btn App-card-option"
                    href="https://app.insurace.io/Insurance/Cart?id=124&referrer=545066382753150189457177837072918687520318754040"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Trans>Purchase Insurance</Trans>
                  </a>
                )} */}
              </div>
            </div>
          </div>
          <div className="App-card StakeV2-esUnity-card bg-green-bottom-right">
            <div className="App-card-title">
              <Trans>esUNITY Price</Trans>
              <div>
                $0<span className="text-green">.00</span>
                {/* ${formatAmount(unityPrice, USD_DECIMALS, 2, true)} */}
              </div>
            </div>
            <div className="App-card-content">
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Wallet</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "esUnityBalance", 18, 2, true)}{" "}
                    <span className="text-green">esUNITY</span> ($
                    {formatKeyAmount(processedData, "esUnityBalanceUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Staked</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "esUnityInStakedUnity", 18, 2, true)}{" "}
                    <span className="text-green">esUNITY</span> ($
                    {formatKeyAmount(processedData, "esUnityInStakedUnityUsd", USD_DECIMALS, 2, true)})
                  </div>
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>APR</Trans>
                  </div>
                  <div>
                    <div>
                      <Tooltip
                        handle={`${formatKeyAmount(processedData, "unityAprTotalWithBoost", 2, 2, true)}%`}
                        position="right-bottom"
                        renderContent={() => {
                          return (
                            <>
                              <StatsTooltipRow
                                label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) Base APR`}
                                value={`${formatKeyAmount(processedData, "unityAprForNativeToken", 2, 2, true)}%`}
                                showDollar={false}
                              />
                              {processedData.bnUnityInFeeUnity && processedData.bnUnityInFeeUnity.gt(0) && (
                                <StatsTooltipRow
                                  label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) Boosted APR`}
                                  value={`${formatKeyAmount(
                                    processedData,
                                    "unityBoostAprForNativeToken",
                                    2,
                                    2,
                                    true
                                  )}%`}
                                  showDollar={false}
                                />
                              )}
                              <StatsTooltipRow
                                label="Escrowed $UNITY APR"
                                value={`${formatKeyAmount(processedData, "unityAprForEsUnity", 2, 2, true)}%`}
                                showDollar={false}
                              />
                            </>
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">{renderMultiplierPointsLabel()}</div>
                  <div>{renderMultiplierPointsValue()}</div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Staked</Trans>
                  </div>
                  <div>
                    {formatKeyAmount(processedData, "stakedEsUnitySupply", 18, 0, true)} esUNITY ($
                    {formatKeyAmount(processedData, "stakedEsUnitySupplyUsd", USD_DECIMALS, 0, true)})
                  </div>
                </div>
                <div className="App-card-row">
                  <div className="label">
                    <Trans>Total Supply</Trans>
                  </div>
                  <div>
                    {formatAmount(esUnitySupply, 18, 0, true)} esUNITY ($
                    {formatAmount(esUnitySupplyUsd, USD_DECIMALS, 0, true)})
                  </div>
                </div>
              </div>
              <div className="App-card-options">
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showStakeEsUnityModal()}>
                    <Trans>Stake</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUnstakeEsUnityModal()}>
                    <Trans>Unstake</Trans>
                  </button>
                )}
                {!active && (
                  <button className="default-btn App-card-option" onClick={() => connectWallet()}>
                    <Trans> Connect Wallet</Trans>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="default-container py-50">
        <div className="section-title-block">
          <div className="section-title-icon">
            <img src={levelSymbol} alt="LOGO Icon" />
          </div>
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Vest</Trans>
            </div>
            <div className="Page-description">
              <Trans>Convert esUNITY tokens to $UNITY tokens.</Trans>
            </div>
          </div>
        </div>
        <div className="StakeV3-cards">
          <div className="App-card App-card-bg-box StakeV2-unity-card">
            <div className="App-card-title">
              <Trans>$UNITY Vault</Trans>
            </div>
            <div className="App-card-content">
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Staked Tokens</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={formatAmount(totalRewardTokens, 18, 2, true)}
                    position="right-bottom"
                    renderContent={() => {
                      return (
                        <>
                          <StatsTooltipRow
                            showDollar={false}
                            label="$UNITY"
                            value={formatAmount(processedData.unityInStakedUnity, 18, 2, true)}
                          />

                          <StatsTooltipRow
                            showDollar={false}
                            label="esUNITY"
                            value={formatAmount(processedData.esUnityInStakedUnity, 18, 2, true)}
                          />
                          <StatsTooltipRow
                            showDollar={false}
                            label="Multiplier Points"
                            value={formatAmount(processedData.bnUnityInFeeUnity, 18, 2, true)}
                          />
                        </>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Reserved for Vesting</Trans>
                </div>
                <div>
                  {formatKeyAmount(vestingData, "unityVesterPairAmount", 18, 2, true)} /{" "}
                  {formatAmount(totalRewardTokens, 18, 2, true)}
                </div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Vesting Status</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={`${formatKeyAmount(vestingData, "unityVesterClaimSum", 18, 4, true)} / ${formatKeyAmount(
                      vestingData,
                      "unityVesterVestedAmount",
                      18,
                      4,
                      true
                    )}`}
                    position="right-bottom"
                    renderContent={() => {
                      return (
                        <div>
                          <Trans>
                            {formatKeyAmount(vestingData, "unityVesterClaimSum", 18, 4, true)} tokens have been
                            converted to $UNITY from the{" "}
                            {formatKeyAmount(vestingData, "unityVesterVestedAmount", 18, 4, true)} esUNITY deposited for
                            vesting.
                          </Trans>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Claimable</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={`${formatKeyAmount(vestingData, "unityVesterClaimable", 18, 4, true)} $UNITY`}
                    position="right-bottom"
                    renderContent={() => (
                      <Trans>
                        {formatKeyAmount(vestingData, "unityVesterClaimable", 18, 4, true)} $UNITY tokens can be
                        claimed, use the options under the Total Rewards section to claim them.
                      </Trans>
                    )}
                  />
                </div>
              </div>
              <div className="App-card-options" style={{ marginTop: "30px" }}>
                {!active && (
                  <button className="default-btn App-card-option" onClick={() => connectWallet()}>
                    <Trans>Connect Wallet</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUnityVesterDepositModal()}>
                    <Trans>Deposit</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUnityVesterWithdrawModal()}>
                    <Trans>Withdraw</Trans>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="App-card App-card-bg-box StakeV2-unity-card">
            <div className="App-card-title">
              <Trans>$ULP Vault</Trans>
            </div>
            <div className="App-card-content">
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Staked Tokens</Trans>
                </div>
                <div>{formatAmount(processedData.ulpBalance, 18, 2, true)} $ULP</div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Reserved for Vesting</Trans>
                </div>
                <div>
                  {formatKeyAmount(vestingData, "ulpVesterPairAmount", 18, 2, true)} /{" "}
                  {formatAmount(processedData.ulpBalance, 18, 2, true)}
                </div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Vesting Status</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={`${formatKeyAmount(vestingData, "ulpVesterClaimSum", 18, 4, true)} / ${formatKeyAmount(
                      vestingData,
                      "ulpVesterVestedAmount",
                      18,
                      4,
                      true
                    )}`}
                    position="right-bottom"
                    renderContent={() => {
                      return (
                        <div>
                          <Trans>
                            {formatKeyAmount(vestingData, "ulpVesterClaimSum", 18, 4, true)} tokens have been converted
                            to $UNITY from the {formatKeyAmount(vestingData, "ulpVesterVestedAmount", 18, 4, true)}{" "}
                            esUNITY deposited for vesting.
                          </Trans>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="App-card-row bg-none">
                <div className="label">
                  <Trans>Claimable</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={`${formatKeyAmount(vestingData, "ulpVesterClaimable", 18, 4, true)} $UNITY`}
                    position="right-bottom"
                    renderContent={() => (
                      <Trans>
                        {formatKeyAmount(vestingData, "ulpVesterClaimable", 18, 4, true)} $UNITY tokens can be claimed,
                        use the options under the Total Rewards section to claim them.
                      </Trans>
                    )}
                  />
                </div>
              </div>
              <div className="App-card-options" style={{ marginTop: "30px" }}>
                {!active && (
                  <button className="default-btn App-card-option" onClick={() => connectWallet()}>
                    <Trans>Connect Wallet</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUlpVesterDepositModal()}>
                    <Trans>Deposit</Trans>
                  </button>
                )}
                {active && (
                  <button className="default-btn App-card-option" onClick={() => showUlpVesterWithdrawModal()}>
                    <Trans>Withdraw</Trans>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
