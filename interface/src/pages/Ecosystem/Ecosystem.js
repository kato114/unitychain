import React from "react";
import { Trans } from "@lingui/macro";
import SEO from "components/Common/SEO";

import Footer from "components/Footer/Footer";
import { getPageTitle } from "lib/legacy";

import { FaTelegramPlane } from "react-icons/fa";

import bscIcon from "img/ic_bsc_16.svg";
import polygonIcon from "img/ic_polygon_16.svg";
import optimismIcon from "img/ic_optimism_16.svg";
import arbitrumIcon from "img/ic_arbitrum_16.svg";
import UnityIcon from "img/level_symbol.png";

import "./Ecosystem.css";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { ARBITRUM } from "config/chains"; // POLYGON, BSC, OPTIMISM,
import { t } from "@lingui/macro";

const NETWORK_ICONS = {
  // [BSC]: bscIcon,
  // [POLYGON]: polygonIcon,
  // [OPTIMISM]: optimismIcon,
  [ARBITRUM]: arbitrumIcon,
};

const NETWORK_ICON_ALTS = {
  // [BSC]: "Bsc Icon",
  // [POLYGON]: "Polygon Icon",
  // [OPTIMISM]: "Optimism Icon",
  [ARBITRUM]: "Arbitrum Icon",
};

export default function Ecosystem() {
  const communityProjects = [];
  const dashboardProjects = [];
  const integrations = [];

  const telegramGroups = [
    {
      title: "$UNITY",
      link: "https://t.me/unitychain",
      linkLabel: "t.me",
      about: t`Telegram Group`,
    },
    {
      title: "$UNITY Trading Chat",
      link: "https://t.me/UnityChain_Official/8650",
      linkLabel: "t.me",
      about: t`$UNITY community discussion`,
    },
    {
      title: "Dao",
      link: "https://t.me/UnityChain_Official/8631",
      linkLabel: "t.me",
      about: t`Telegram Dao Group`,
    },
    {
      title: "Announcements",
      link: "https://t.me/UnityChain_Official/8629",
      linkLabel: "t.me",
      about: t`Telegram Announcements Group`,
    },
  ];

  return (
    <SEO title={getPageTitle("Ecosystem Projects")}>
      <div className="default-container page-layout">
        <div className="section-title-block">
          <div className="section-title-icon">
            <img src={UnityIcon} alt="UnityIcon" />
          </div>
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Ecosystem</Trans>
            </div>
            <div className="Page-description">
              <Trans>Community-led Telegram groups</Trans>
            </div>
          </div>
        </div>
        <div className="DashboardV2-projects py-50">
          {telegramGroups.map((item) => {
            const linkLabel = item.linkLabel ? item.linkLabel : item.link;
            return (
              <div className="Eco-card bg-red-bottom-left" key={item.title}>
                <h3 className="text-center">{item.title}</h3>
                <span className="text-center">{item.about}</span>
                <ExternalLink className="default-btn" href={item.link}>
                  <FaTelegramPlane size="20px" />
                  Join
                </ExternalLink>
              </div>
            );
          })}
        </div>
      </div>
    </SEO>
  );
}
