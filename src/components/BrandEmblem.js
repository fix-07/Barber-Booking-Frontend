import React from "react";

/**
 * The site's signature illustration: a large emblem built from geometry,
 * not a photograph.
 *
 * ============================================================
 *  WHY THIS EXISTS
 * ============================================================
 * A premium hero usually leans on a large, well-composed photograph. This
 * project has a standing rule against that: there is no licensed photo of a
 * real shop or barber to use, and a stock or AI-generated "barbershop"
 * image would misrepresent a real business -- the same reasoning that has
 * kept photography off BarberCard and the carousel throughout this project.
 *
 * So the composition does the work a photograph would normally do: one
 * large, deliberate, original piece of line art, built the way a wax-seal
 * or a watch face is built -- concentric rings, a compass of tick marks,
 * and a mark at the centre.
 *
 * ============================================================
 *  IT IS THE SITE'S OWN MARK, SCALED UP -- NOT A NEW SYMBOL
 * ============================================================
 * The centre of the emblem is the same five-bar comb mark already used as
 * the favicon and in the header and footer, just drawn larger. A brand
 * should not introduce a second, unrelated symbol for decoration; the ring
 * of tick marks exists to give the *existing* mark somewhere to sit, the
 * way a monogram sits inside a seal.
 *
 * ============================================================
 *  THE GEOMETRY IS COMPUTED, NOT EYEBALLED
 * ============================================================
 * All 60 tick marks are placed by trigonometry (6 degrees apart, generated
 * with a short script, not hand-typed coordinates), so they are genuinely
 * even. Every 5th tick is longer and bolder, the way a clock face marks its
 * hours differently from its minutes -- a real reason for the two tick
 * lengths to exist, not an arbitrary pattern.
 */
const BrandEmblem = ({ className = "" }) => (
  <svg
    className={`bb-emblem ${className}`}
    viewBox="0 0 400 400"
    role="img"
    aria-label="VEYRON emblem"
  >
    {/* Outer and middle rings */}
    <circle cx="200" cy="200" r="188" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.32" />

    {/* 60 ticks, 6 degrees apart, computed by trigonometry. Every 5th tick
        is longer and bolder, like the hour marks on a watch face. */}
    <g>
      <line x1="200.00" y1="12.00" x2="200.00" y2="32.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="219.65" y1="13.03" x2="218.61" y2="22.98" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="239.09" y1="16.11" x2="237.01" y2="25.89" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="258.10" y1="21.20" x2="255.01" y2="30.71" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="276.47" y1="28.25" x2="272.40" y2="37.39" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="294.00" y1="37.19" x2="284.00" y2="54.51" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="310.50" y1="47.90" x2="304.63" y2="55.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="325.80" y1="60.29" x2="319.11" y2="67.72" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="339.71" y1="74.20" x2="332.28" y2="80.89" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="352.10" y1="89.50" x2="344.01" y2="95.37" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="362.81" y1="106.00" x2="345.49" y2="116.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="371.75" y1="123.53" x2="362.61" y2="127.60" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="378.80" y1="141.90" x2="369.29" y2="144.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="383.89" y1="160.91" x2="374.11" y2="162.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="386.97" y1="180.35" x2="377.02" y2="181.39" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="388.00" y1="200.00" x2="368.00" y2="200.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="386.97" y1="219.65" x2="377.02" y2="218.61" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="383.89" y1="239.09" x2="374.11" y2="237.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="378.80" y1="258.10" x2="369.29" y2="255.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="371.75" y1="276.47" x2="362.61" y2="272.40" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="362.81" y1="294.00" x2="345.49" y2="284.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="352.10" y1="310.50" x2="344.01" y2="304.63" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="339.71" y1="325.80" x2="332.28" y2="319.11" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="325.80" y1="339.71" x2="319.11" y2="332.28" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="310.50" y1="352.10" x2="304.63" y2="344.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="294.00" y1="362.81" x2="284.00" y2="345.49" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="276.47" y1="371.75" x2="272.40" y2="362.61" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="258.10" y1="378.80" x2="255.01" y2="369.29" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="239.09" y1="383.89" x2="237.01" y2="374.11" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="219.65" y1="386.97" x2="218.61" y2="377.02" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="200.00" y1="388.00" x2="200.00" y2="368.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="180.35" y1="386.97" x2="181.39" y2="377.02" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="160.91" y1="383.89" x2="162.99" y2="374.11" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="141.90" y1="378.80" x2="144.99" y2="369.29" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="123.53" y1="371.75" x2="127.60" y2="362.61" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="106.00" y1="362.81" x2="116.00" y2="345.49" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="89.50" y1="352.10" x2="95.37" y2="344.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="74.20" y1="339.71" x2="80.89" y2="332.28" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="60.29" y1="325.80" x2="67.72" y2="319.11" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="47.90" y1="310.50" x2="55.99" y2="304.63" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="37.19" y1="294.00" x2="54.51" y2="284.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="28.25" y1="276.47" x2="37.39" y2="272.40" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="21.20" y1="258.10" x2="30.71" y2="255.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="16.11" y1="239.09" x2="25.89" y2="237.01" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="13.03" y1="219.65" x2="22.98" y2="218.61" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="12.00" y1="200.00" x2="32.00" y2="200.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="13.03" y1="180.35" x2="22.98" y2="181.39" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="16.11" y1="160.91" x2="25.89" y2="162.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="21.20" y1="141.90" x2="30.71" y2="144.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="28.25" y1="123.53" x2="37.39" y2="127.60" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="37.19" y1="106.00" x2="54.51" y2="116.00" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="47.90" y1="89.50" x2="55.99" y2="95.37" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="60.29" y1="74.20" x2="67.72" y2="80.89" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="74.20" y1="60.29" x2="80.89" y2="67.72" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="89.50" y1="47.90" x2="95.37" y2="55.99" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="106.00" y1="37.19" x2="116.00" y2="54.51" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <line x1="123.53" y1="28.25" x2="127.60" y2="37.39" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="141.90" y1="21.20" x2="144.99" y2="30.71" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="160.91" y1="16.11" x2="162.99" y2="25.89" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
      <line x1="180.35" y1="13.03" x2="181.39" y2="22.98" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
    </g>

    {/* The site's own comb mark, the same shape used in the header and
        favicon, scaled up to sit at the emblem's centre. */}
    <g transform="translate(200,200) scale(2.6) translate(-32,-32)">
      <rect x="14" y="17" width="36" height="7" rx="2" fill="currentColor" />
      <rect x="17" y="26" width="4" height="21" rx="1.6" fill="currentColor" />
      <rect x="25" y="26" width="4" height="21" rx="1.6" fill="currentColor" />
      <rect x="33" y="26" width="4" height="21" rx="1.6" fill="currentColor" />
      <rect x="41" y="26" width="4" height="21" rx="1.6" fill="currentColor" />
    </g>
  </svg>
);

export default BrandEmblem;
