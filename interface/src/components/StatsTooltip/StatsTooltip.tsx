import { Trans } from "@lingui/macro";
import { BigNumber } from "ethers";
import { USD_DECIMALS } from "lib/legacy";
import "./StatsTooltip.css";
import { formatAmount } from "lib/numbers";

type Props = {
  title: string;
  total?: BigNumber;
  maticValue?: BigNumber;
  bscValue?: BigNumber;
  optimismValue?: BigNumber;
  arbitrumValue?: BigNumber;
  showDollar?: boolean;
  decimalsForConversion: number;
  symbol: string;
  isFloatNum?: boolean;
};

export default function StatsTooltip({
  title,
  total,
  maticValue,
  bscValue,
  optimismValue,
  arbitrumValue,
  showDollar = true,
  decimalsForConversion = USD_DECIMALS,
  symbol,
  isFloatNum = false,
}: Props) {
  return (
    <>
      {/* <p className="Tooltip-row">
        <span className="label">
          <Trans>{title} on Bsc:</Trans>
        </span>
        <span className="amount">
          {showDollar && "$"}
          {formatAmount(bscValue, decimalsForConversion, 0, true)}
          {!showDollar && symbol && " " + symbol}
        </span>
      </p> */}
      {/* <p className="Tooltip-row">
        <span className="label">
          <Trans>{title}:</Trans>
        </span>
        <span className="amount">
          {!isFloatNum && showDollar && "$"}
          {isFloatNum && "" + maticValue}
          {!isFloatNum && formatAmount(maticValue, decimalsForConversion, 0, true)}
          {!showDollar && symbol && " " + symbol}
        </span>
      </p> */}
      {/* <div className="Tooltip-divider" /> */}
      <p className="Tooltip-row">
        <span className="label">
          <Trans>Total:</Trans>
        </span>
        <span className="amount">
          {!isFloatNum && showDollar && "$"}
          {isFloatNum && "" + total}
          {!isFloatNum && formatAmount(total, decimalsForConversion, 0, true)}
          {!showDollar && symbol && " " + symbol}
        </span>
      </p>
    </>
  );
}
