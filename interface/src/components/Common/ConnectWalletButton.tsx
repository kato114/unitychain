import { ReactNode } from "react";
import cx from "classnames";
import "./Button.css";

type Props = {
  imgSrc: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

export default function ConnectWalletButton({ imgSrc, children, onClick, className }: Props) {
  let classNames = cx("secondary-btn", className);
  return (
    <button className={classNames} onClick={onClick}>
      <span className="btn-label">{children}</span>
    </button>
  );
}
