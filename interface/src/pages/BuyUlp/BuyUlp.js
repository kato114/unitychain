import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import UlpSwap from "components/Ulp/UlpSwap";
import buyULPIcon from "img/ic_buy_ulp.svg";
import Footer from "components/Footer/Footer";
import "./BuyUlp.css";

import { Trans } from "@lingui/macro";
import { getNativeToken } from "config/tokens";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { t } from "@lingui/macro";

export default function BuyUlp(props) {
  const { chainId } = useChainId();
  const history = useHistory();
  const [isBuying, setIsBuying] = useState(true);
  const nativeTokenSymbol = getNativeToken(chainId).symbol;

  useEffect(() => {
    const hash = history.location.hash.replace("#", "");
    const buying = hash === "redeem" ? false : true;
    setIsBuying(buying);
  }, [history.location.hash]);

  return (
    <div className="default-container page-layout py-100">
      <div className="section-title-block">
        <div className="section-title-content">
          <div className="Page-title" style={{ paddingLeft: "15px" }}>
            <Trans>Buy / Sell $ULP</Trans>
          </div>
        </div>
      </div>
      <UlpSwap {...props} isBuying={isBuying} setIsBuying={setIsBuying} />
    </div>
  );
}
