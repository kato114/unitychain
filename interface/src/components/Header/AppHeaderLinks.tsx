import React from "react";
import { FiX } from "react-icons/fi";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";

import { HeaderLink } from "./HeaderLink";
import "./Header.css";
import { isHomeSite } from "lib/legacy";

import { AiOutlineHome, AiOutlineIdcard, AiOutlinePlus, AiOutlineLineChart } from "react-icons/ai";
import { RiHandCoinLine } from "react-icons/ri";
import { FaDollarSign } from "react-icons/fa";
import { BiWorld } from "react-icons/bi";

import logoImg from "img/logo_UNITY.png";
import dividerIcon from "img/ic_divider.png";

type Props = {
  small?: boolean;
  clickCloseIcon?: () => void;
  openSettings?: () => void;
  redirectPopupTimestamp: number;
  showRedirectModal: (to: string) => void;
};

export function AppHeaderLinks({
  small,
  openSettings,
  clickCloseIcon,
  redirectPopupTimestamp,
  showRedirectModal,
}: Props) {
  return (
    <div className="App-header-links">
      {small && (
        <div className="App-header-links-header">
          <Link className="App-header-link-main" to="/">
            <img src={logoImg} alt="UNITY Logo" />
          </Link>
          <div
            className="App-header-menu-icon-block mobile-cross-menu"
            onClick={() => clickCloseIcon && clickCloseIcon()}
          >
            <FiX className="App-header-menu-icon" />
          </div>
        </div>
      )}
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          isHomeLink={true}
          to="/"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <AiOutlineHome size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Home</Trans>
          </span>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/dashboard"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <AiOutlineIdcard size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Dashboard</Trans>
          </span>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/earn"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <RiHandCoinLine size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Earn</Trans>
          </span>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/buy"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <FaDollarSign size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Buy</Trans>
          </span>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/referrals"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <AiOutlinePlus size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Referrals</Trans>
          </span>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/ecosystem"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <BiWorld size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Ecosystem</Trans>
          </span>
        </HeaderLink>
      </div>
      <img src={dividerIcon} alt="Polygon Icon" width="100%" style={{ margin: "23px 0px" }} />
      <div className="App-header-link-container">
        <HeaderLink
          className="default-btn text-center"
          to="/trade"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <AiOutlineLineChart size="20px" />
          <span style={{ marginLeft: "5px" }}>
            <Trans>Trade</Trans>
          </span>
        </HeaderLink>
      </div>

      {small && !isHomeSite() && (
        <div className="App-header-link-container">
          {/* eslint-disable-next-line */}
          <a href="#" className="default-btn" onClick={openSettings}>
            <Trans>Settings</Trans>
          </a>
        </div>
      )}
    </div>
  );
}
