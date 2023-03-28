import { Menu } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import "./AssetDropdown.css";
import coingeckoIcon from "img/ic_coingecko_16.svg";
import bscIcon from "img/ic_bsc_16.svg";
import polygonIcon from "img/ic_polygon_16.svg";
import optimismIcon from "img/ic_optimism_16.svg";
import arbitrumIcon from "img/ic_arbitrum_16.svg";
import metamaskIcon from "img/ic_metamask_16.svg";
import { useWeb3React } from "@web3-react/core";

import { t, Trans } from "@lingui/macro";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { ICONLINKS, PLATFORM_TOKENS } from "config/tokens";
import { addTokenToMetamask } from "lib/wallets";
import { useChainId } from "lib/chains";

function AssetDropdown({ assetSymbol, assetInfo }) {
  const { active } = useWeb3React();
  const { chainId } = useChainId();
  let { coingecko, arbitrum } = ICONLINKS[chainId][assetSymbol] || {}; //bsc, polygon, optimism,
  const unavailableTokenSymbols = [];

  return (
    <Menu>
      <Menu.Button as="div" className="dropdown-arrow center-both">
        <FiChevronDown size={20} />
      </Menu.Button>
      <Menu.Items as="div" className="asset-menu-items">
        <Menu.Item>
          <>
            {coingecko && (
              <ExternalLink href={coingecko} className="asset-item">
                <img src={coingeckoIcon} alt="Open in Coingecko" />
                <p>
                  <Trans>Open in Coingecko</Trans>
                </p>
              </ExternalLink>
            )}
          </>
        </Menu.Item>
        <Menu.Item>
          <>
            {/* {bsc && (
              <ExternalLink href={bsc} className="asset-item">
                <img src={bscIcon} alt="Open in explorer" width="16px" />
                <p>
                  <Trans>Open in Explorer</Trans>
                </p>
              </ExternalLink>
            )}
            {polygon && (
              <ExternalLink href={polygon} className="asset-item">
                <img src={polygonIcon} alt="Open in explorer" />
                <p>
                  <Trans>Open in Explorer</Trans>
                </p>
              </ExternalLink>
            )}
            {optimism && (
              <ExternalLink href={optimism} className="asset-item">
                <img src={optimismIcon} alt="Open in explorer" />
                <p>
                  <Trans>Open in Explorer</Trans>
                </p>
              </ExternalLink>
            )} */}
            {arbitrum && (
              <ExternalLink href={arbitrum} className="asset-item">
                <img src={arbitrumIcon} alt="Open in explorer" />
                <p>
                  <Trans>Open in Explorer</Trans>
                </p>
              </ExternalLink>
            )}
          </>
        </Menu.Item>
        <Menu.Item>
          <>
            {active && unavailableTokenSymbols.indexOf(assetSymbol) < 0 && (
              <div
                onClick={() => {
                  let token = assetInfo
                    ? { ...assetInfo, image: assetInfo.imageUrl }
                    : PLATFORM_TOKENS[chainId][assetSymbol];
                  addTokenToMetamask(token);
                }}
                className="asset-item"
              >
                <img src={metamaskIcon} alt={t`Add to Metamask`} />
                <p>
                  <Trans>Add to Metamask</Trans>
                </p>
              </div>
            )}
          </>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default AssetDropdown;
