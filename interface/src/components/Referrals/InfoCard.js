import Tooltip from "../Tooltip/Tooltip";

function InfoCard({ label, data, tooltipText, toolTipPosition = "left-bottom" }) {
  return (
    <div className="info-card">
      <div className="card-details">
        <div className="data">{data}</div>
        <h3 className="label">
          {tooltipText ? (
            <Tooltip handle={label} position={toolTipPosition} renderContent={() => tooltipText} />
          ) : (
            label
          )}
        </h3>
      </div>
    </div>
  );
}

export default InfoCard;
