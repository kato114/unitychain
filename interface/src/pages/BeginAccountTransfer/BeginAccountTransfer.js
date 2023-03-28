import React, { useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import { getContract } from "config/contracts";

import Modal from "components/Modal/Modal";
import Footer from "components/Footer/Footer";

import Token from "abis/Token.json";
import Vester from "abis/Vester.json";
import RewardTracker from "abis/RewardTracker.json";
import RewardRouter from "abis/RewardRouter.json";

import { FaCheck, FaTimes } from "react-icons/fa";

import { Trans, t } from "@lingui/macro";

import "./BeginAccountTransfer.css";
import { callContract, contractFetcher } from "lib/contracts";
import { approveTokens } from "domain/tokens";
import { useChainId } from "lib/chains";

function ValidationRow({ isValid, children }) {
  return (
    <div className="ValidationRow">
      <div className="ValidationRow-icon-container">
        {isValid && <FaCheck className="ValidationRow-icon" />}
        {!isValid && <FaTimes className="ValidationRow-icon" />}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function BeginAccountTransfer(props) {
  const { setPendingTxns } = props;
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const [receiver, setReceiver] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isTransferSubmittedModalVisible, setIsTransferSubmittedModalVisible] = useState(false);
  let parsedReceiver = ethers.constants.AddressZero;
  if (ethers.utils.isAddress(receiver)) {
    parsedReceiver = receiver;
  }

  const unityAddress = getContract(chainId, "UNITY");
  const unityVesterAddress = getContract(chainId, "UnityVester");
  const ulpVesterAddress = getContract(chainId, "UlpVester");

  const rewardRouterAddress = getContract(chainId, "RewardRouter");

  const { data: unityVesterBalance } = useSWR([active, chainId, unityVesterAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, Token),
  });

  const { data: ulpVesterBalance } = useSWR([active, chainId, ulpVesterAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, Token),
  });

  const stakedUnityTrackerAddress = getContract(chainId, "StakedUnityTracker");
  const { data: cumulativeUnityRewards } = useSWR(
    [active, chainId, stakedUnityTrackerAddress, "cumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const stakedUlpTrackerAddress = getContract(chainId, "StakedUlpTracker");
  const { data: cumulativeUlpRewards } = useSWR(
    [active, chainId, stakedUlpTrackerAddress, "cumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const { data: transferredCumulativeUnityRewards } = useSWR(
    [active, chainId, unityVesterAddress, "transferredCumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, Vester),
    }
  );

  const { data: transferredCumulativeUlpRewards } = useSWR(
    [active, chainId, ulpVesterAddress, "transferredCumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, Vester),
    }
  );

  const { data: pendingReceiver } = useSWR([active, chainId, rewardRouterAddress, "pendingReceivers", account], {
    fetcher: contractFetcher(library, RewardRouter),
  });

  const { data: unityAllowance } = useSWR(
    [active, chainId, unityAddress, "allowance", account, stakedUnityTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { data: unityStaked } = useSWR(
    [active, chainId, stakedUnityTrackerAddress, "depositBalances", account, unityAddress],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const needApproval = unityAllowance && unityStaked && unityStaked.gt(unityAllowance);

  const hasVestedUnity = unityVesterBalance && unityVesterBalance.gt(0);
  const hasVestedUlp = ulpVesterBalance && ulpVesterBalance.gt(0);
  const hasStakedUnity =
    (cumulativeUnityRewards && cumulativeUnityRewards.gt(0)) ||
    (transferredCumulativeUnityRewards && transferredCumulativeUnityRewards.gt(0));
  const hasStakedUlp =
    (cumulativeUlpRewards && cumulativeUlpRewards.gt(0)) ||
    (transferredCumulativeUlpRewards && transferredCumulativeUlpRewards.gt(0));
  const hasPendingReceiver = pendingReceiver && pendingReceiver !== ethers.constants.AddressZero;

  const getError = () => {
    if (!account) {
      return t`Wallet is not connected`;
    }
    if (hasVestedUnity) {
      return t`Vested $UNITY not withdrawn`;
    }
    if (hasVestedUlp) {
      return t`Vested $ULP not withdrawn`;
    }
    if (!receiver || receiver.length === 0) {
      return t`Enter Receiver Address`;
    }
    if (!ethers.utils.isAddress(receiver)) {
      return t`Invalid Receiver Address`;
    }
    if (hasStakedUnity || hasStakedUlp) {
      return t`Invalid Receiver`;
    }
    if ((parsedReceiver || "").toString().toLowerCase() === (account || "").toString().toLowerCase()) {
      return t`Self-transfer not supported`;
    }

    if (
      (parsedReceiver || "").length > 0 &&
      (parsedReceiver || "").toString().toLowerCase() === (pendingReceiver || "").toString().toLowerCase()
    ) {
      return t`Transfer already initiated`;
    }
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isApproving) {
      return false;
    }
    if (isTransferring) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (needApproval) {
      return t`Approve $UNITY`;
    }
    if (isApproving) {
      return t`Approving...`;
    }
    if (isTransferring) {
      return t`Transferring`;
    }

    return t`Begin Transfer`;
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

    setIsTransferring(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());

    callContract(chainId, contract, "signalTransfer", [parsedReceiver], {
      sentMsg: t`Transfer submitted!`,
      failMsg: t`Transfer failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsTransferSubmittedModalVisible(true);
      })
      .finally(() => {
        setIsTransferring(false);
      });
  };

  const completeTransferLink = `/complete_account_transfer/${account}/${parsedReceiver}`;
  const pendingTransferLink = `/complete_account_transfer/${account}/${pendingReceiver}`;

  return (
    <div className="BeginAccountTransfer Page page-layout">
      <Modal
        isVisible={isTransferSubmittedModalVisible}
        setIsVisible={setIsTransferSubmittedModalVisible}
        label={t`Transfer Submitted`}
      >
        <Trans>Your transfer has been initiated.</Trans>
        <br />
        <br />
        <Link className="App-cta" to={completeTransferLink}>
          <Trans>Continue</Trans>
        </Link>
      </Modal>
      <div className="Page-title-section">
        <div className="Page-title">
          <Trans>Transfer Account</Trans>
        </div>
        <div className="Page-description">
          <Trans>
            Please only use this for full account transfers.
            <br />
            This will transfer all your $UNITY, esUNITY, $ULP and Multiplier Points to your new account.
            <br />
            Transfers are only supported if the receiving account has not staked $UNITY or $ULP tokens before.
            <br />
            Transfers are one-way, you will not be able to transfer staked tokens back to the sending account.
          </Trans>
        </div>
        {hasPendingReceiver && (
          <div className="Page-description">
            <Trans>
              You have a <Link to={pendingTransferLink}>pending transfer</Link> to {pendingReceiver}.
            </Trans>
          </div>
        )}
      </div>
      <div className="Page-content">
        <div className="input-form">
          <div className="input-row">
            <label className="input-label">
              <Trans>Receiver Address</Trans>
            </label>
            <div>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="text-input"
              />
            </div>
          </div>
          <div className="BeginAccountTransfer-validations">
            <ValidationRow isValid={!hasVestedUnity}>
              <Trans>Sender has withdrawn all tokens from $UNITY Vesting Vault</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasVestedUlp}>
              <Trans>Sender has withdrawn all tokens from $ULP Vesting Vault</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasStakedUnity}>
              <Trans>Receiver has not staked $UNITY tokens before</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasStakedUlp}>
              <Trans>Receiver has not staked $ULP tokens before</Trans>
            </ValidationRow>
          </div>
          <div className="input-row">
            <button
              className="App-cta Exchange-swap-button"
              disabled={!isPrimaryEnabled()}
              onClick={() => onClickPrimary()}
            >
              {getPrimaryText()}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
