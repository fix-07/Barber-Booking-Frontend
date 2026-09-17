import React from "react";
import { Card } from "react-bootstrap";

/**
 * One KPI card on the Overview dashboard.
 *
 * `changePercent` is null when there is nothing honest to compare against
 * (see percentChange in adminAnalyticsController.js) -- in that case no
 * comparison badge renders at all, rather than a fake "+0%" or "new".
 */
const KpiCard = ({ label, value, changePercent, changeLabel }) => {
  const hasChange = typeof changePercent === "number" && Number.isFinite(changePercent);
  const isUp = hasChange && changePercent > 0;
  const isFlat = hasChange && Math.round(changePercent) === 0;

  return (
    <Card className="h-100 bb-kpi-card">
      <Card.Body>
        <p className="bb-kpi-label mb-2">{label}</p>
        <p className="bb-kpi-value mb-0">{value}</p>

        {hasChange && (
          <p
            className={
              "bb-kpi-change mb-0 " +
              (isFlat ? "is-flat" : isUp ? "is-up" : "is-down")
            }
          >
            {/* The word carries the meaning; the arrow is decorative only. */}
            <span aria-hidden="true">{isFlat ? "→" : isUp ? "↑" : "↓"}</span>{" "}
            {Math.abs(Math.round(changePercent))}% {changeLabel || "vs previous period"}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default KpiCard;
