import React from "react";
import "./Buy.css";
import TokenCard from "components/TokenCard/TokenCard";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";

import secondIcon from "img/ic-earn-2.png";

export default function BuyUNITYULP() {
  return (
    <SEO title={getPageTitle("Buy $ULP or $UNITY")}>
      <div className="BuyUNITYULP">
        <div className="BuyUNITYULP-container default-container py-100">
          <h3 className="text-center">
            <span>Two tokens </span>create our ecosystem
          </h3>
          <div className="text-center BuyUNITYULPIcon" style={{ marginBottom: "20px" }}>
            <img src={secondIcon} />
          </div>
          <TokenCard />
        </div>
      </div>
    </SEO>
  );
}
