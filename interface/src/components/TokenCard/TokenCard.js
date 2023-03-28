import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";

import unityBigIcon from "img/ic_unity_custom.png";
import ulpBigIcon from "img/ic_ulp_custom.png";

import optimismIcon from "img/ic_trading_optimism.png";
import polygonIcon from "img/ic_trading_polygon.png";
import bscIcon from "img/ic_trading_bsc.png";
import zksyncIcon from "img/ic_trading_zksync.png";
import ftmIcon from "img/ic_trading_ftm.png";
import arbitrumIcon from "img/ic_arbitrum_96.svg";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";
import { HeaderLink } from "../Header/HeaderLink";
import { ARBITRUM } from "config/chains"; //BSC, POLYGON, OPTIMISM,
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";
import "./TokenCard.css";

export default function TokenCard({ showRedirectModal, redirectPopupTimestamp }) {
  const isHome = isHomeSite();
  const { chainId } = useChainId();
  const { active } = useWeb3React();

  const changeNetwork = useCallback(
    (network) => {
      if (network === chainId) {
        return;
      }
      if (!active) {
        setTimeout(() => {
          return switchNetwork(network, active);
        }, 500);
      } else {
        return switchNetwork(network, active);
      }
    },
    [chainId, active]
  );

  const BuyLink = ({ className, to, children, network }) => {
    if (isHome && showRedirectModal) {
      return (
        <HeaderLink
          to={to}
          className={className}
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          {children}
        </HeaderLink>
      );
    }

    return (
      <Link to={to} className={className} onClick={() => changeNetwork(network)}>
        {children}
      </Link>
    );
  };

  return (
    <div className="Home-token-card-options">
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-info bg-red-top-right">
          <div className="Home-token-card-option-icon">
            <img src={unityBigIcon} alt="unityBigIcon" width="90px" />
          </div>
          <div className="Home-token-card-option-title">
            <h2>$UNITY</h2>
            <span>
              <Trans>$UNITY is the utility and governance token. Accrues 30% of the platform's generated fees.</Trans>
            </span>
          </div>
        </div>
        <div className="Home-token-card-option-apr">
          {/* <div>
            <div>
              <Trans>
                <span>Bsc APR: </span>
              </Trans>
              <APRLabel chainId={BSC} label="unityAprTotal" />
            </div>
            <BuyLink to="/buy_unity" className="default-btn" network={BSC}>
              <Trans>Buy on Bsc</Trans>
            </BuyLink>
          </div>
          <div>
            <div>
              <Trans>
                <span>Polygon APR: </span>
              </Trans>
              <APRLabel chainId={POLYGON} label="unityAprTotal" key="POLYGON" />
            </div>
            <BuyLink to="/buy_unity" className="default-btn" network={POLYGON}>
              <Trans>Buy on Polygon</Trans>
            </BuyLink>
          </div>
          <div>
            <div>
              <Trans>
                <span>Optimism APR: </span>
              </Trans>
              <APRLabel chainId={OPTIMISM} label="unityAprTotal" key="OPTIMISM" />
            </div>
            <BuyLink to="/buy_unity" className="default-btn" network={OPTIMISM}>
              <Trans>Buy on Optimism</Trans>
            </BuyLink>
          </div> */}
          <div>
            <div>
              <Trans>
                <span>Arbitrum APR: </span>
              </Trans>
              <APRLabel chainId={ARBITRUM} label="unityAprTotal" key="ARBITRUM" />
            </div>
            <a
              href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x9C36A6726aC539066EA6572587bc658D62E59F2d"
              className="default-btn"
              target="_blank"
            >
              <img src={arbitrumIcon} alt="Polygon Icon" width="20px" style={{ marginRight: "8px" }} />
              <Trans>Buy</Trans>
            </a>
          </div>
        </div>
      </div>
      <div className="Home-token-card-between"></div>
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-info bg-gray-top-right">
          <div className="Home-token-card-option-icon">
            <img src={ulpBigIcon} alt="ulpBigIcon" width="90px" />
          </div>
          <div className="Home-token-card-option-title">
            <h2>$ULP</h2>
            <span>
              <Trans>$ULP is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
            </span>
          </div>
        </div>
        <div className="Home-token-card-option-apr">
          {/* <div>
            <div>
              <Trans>
                <span>Bsc APR: </span>
              </Trans>
              <APRLabel chainId={BSC} label="ulpAprTotal" key="BSC" />
            </div>
            <BuyLink to="/buy_ulp" className="default-btn" network={BSC}>
              <Trans>Buy on Bsc</Trans>
            </BuyLink>
          </div>
          <div>
            <div>
              <Trans>
                <span>Polygon APR: </span>
              </Trans>
              <APRLabel chainId={POLYGON} label="ulpAprTotal" key="POLYGON" />
            </div>
            <BuyLink to="/buy_ulp" className="default-btn" network={POLYGON}>
              <Trans>Buy on Polygon</Trans>
            </BuyLink>
          </div>
          <div>
            <div>
              <Trans>
                <span>Optimism APR: </span>
              </Trans>
              <APRLabel chainId={OPTIMISM} label="ulpAprTotal" key="OPTIMISM" />
            </div>
            <BuyLink to="/buy_ulp" className="default-btn" network={OPTIMISM}>
              <Trans>Buy on Optimism</Trans>
            </BuyLink>
          </div> */}
          <div>
            <div>
              <Trans>
                <span style={{ color: "#5c5c5c" }}>Arbitrum APR: </span>
              </Trans>
              <APRLabel chainId={ARBITRUM} label="ulpAprTotal" key="ARBITRUM" />
            </div>
            <BuyLink to="/buy_ulp" className="default-btn" network={ARBITRUM}>
              <img src={arbitrumIcon} alt="Polygon Icon" width="20px" style={{ marginRight: "8px" }} />
              <Trans>Buy</Trans>
            </BuyLink>
          </div>
        </div>
      </div>
    </div>
  );
}
