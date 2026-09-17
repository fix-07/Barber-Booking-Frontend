import React from "react";

import { formatMoney } from "../../utils/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A plain bar chart, hand-built with CSS -- no charting library, matching
 * the rest of this project's "original SVG/CSS instead of a dependency"
 * approach (see BrandEmblem.js). `series` is 7 entries in date order, from
 * adminAnalyticsController.js's dailySeries.
 *
 * The bars are decorative (aria-hidden): the real numbers are in a plain
 * visually-hidden table underneath, so a screen reader gets the same data
 * a sighted person reads off the bar heights.
 */
const WeeklyChart = ({ series, currency = "GBP" }) => {
  const maxCount = Math.max(1, ...series.map((day) => day.bookingsCount));

  return (
    <div>
      <div className="bb-weekly-chart" aria-hidden="true">
        {series.map((day) => {
          const heightPercent = Math.max(4, (day.bookingsCount / maxCount) * 100);
          return (
            <div className="bb-weekly-chart-col" key={day.date}>
              <div className="bb-weekly-chart-track">
                <div
                  className="bb-weekly-chart-bar"
                  style={{ height: `${heightPercent}%` }}
                  title={`${day.bookingsCount} booking${day.bookingsCount === 1 ? "" : "s"}`}
                />
              </div>
              <span className="bb-weekly-chart-count">{day.bookingsCount}</span>
              <span className="bb-weekly-chart-day">
                {DAY_LABELS[new Date(`${day.date}T00:00:00Z`).getUTCDay()]}
              </span>
            </div>
          );
        })}
      </div>

      <table className="visually-hidden">
        <caption>Bookings and revenue for the last 7 days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Bookings</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {series.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.date}</th>
              <td>{day.bookingsCount}</td>
              <td>{formatMoney(day.revenueMinor, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyChart;
