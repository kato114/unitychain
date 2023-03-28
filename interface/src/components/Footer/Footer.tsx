import React from "react";
import cx from "classnames";
import { t } from "@lingui/macro";
import "./Footer.css";
import logoImg from "img/logo_white.png";
import twitterIcon from "img/ic_twitter.png";
import telegramIcon from "img/ic_telegram.png";
import githubIcon from "img/ic_github.svg";
import mediumIcon from "img/ic_medium.png";
import powerImg from "img/footer-power.png";
import { NavLink } from "react-router-dom";
import { isHomeSite, getAppBaseUrl, shouldShowRedirectModal } from "lib/legacy";

const footerLinks = {
  home: [
    { text: t`Terms and Conditions`, link: "/terms-and-conditions" },
    {
      text: t`Referral Terms`,
      link: "https://docs.utrade.exchange/how-it-works/referrals",
      external: true,
    },
    { text: t`Media Kit`, link: "https://docs.utrade.exchange/", external: true },
    // { text: "Jobs", link: "/jobs", isAppLink: true },
  ],
  app: [
    { text: t`Terms and Conditions`, link: "/terms-and-conditions" },
    { text: t`Referral Terms`, link: "/referral-terms" },
    { text: t`Media Kit`, link: "https://docs.utrade.exchange/", external: true },
    // { text: "Jobs", link: "/jobs" },
  ],
};

const socialLinks = [
  { link: "https://twitter.com/unitychain_", name: "Twitter", icon: twitterIcon },
  { link: "https://medium.com/@unitychainio", name: "Medium", icon: mediumIcon },
  // { link: "https://github.com/unity-chain", name: "Github", icon: githubIcon },
  { link: "https://t.me/UnityChain_Official", name: "Telegram", icon: telegramIcon },
];

type Props = { showRedirectModal?: (to: string) => void; redirectPopupTimestamp?: () => void };

export default function Footer({ showRedirectModal, redirectPopupTimestamp }: Props) {
  const isHome = isHomeSite();

  return (
    <div className="Footer">
      <div className="Footer-social-link-block">
        <img src={logoImg} className="big" alt="UNITY Logo" width="60px" style={{ marginRight: "5px" }} />
        {socialLinks.map((platform) => {
          return (
            <a
              key={platform.name}
              className="App-social-link"
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={platform.icon} alt={platform.name} width="20px" />
            </a>
          );
        })}
      </div>
      <div className="text-center">
        <img src={powerImg} />
      </div>
    </div>
  );
}
