import React from "react";

/**
 * The VEYRON "V" monogram: a single geometric letterform, drawn as one
 * filled polygon rather than stroked lines, so the join at the point is a
 * true sharp miter with no seam. Same hand-authored-SVG approach as the
 * comb mark (Header.js, favicon.svg) and the compass emblem
 * (BrandEmblem.js) -- no icon library, nothing traced from an existing logo.
 *
 * Uses currentColor so it can sit in gold on a dark sidebar or in ink on a
 * light surface, the same flexibility BrandEmblem.js uses.
 */
const VeyronMonogram = ({ className = "" }) => (
  <svg
    className={`bb-monogram ${className}`}
    viewBox="0 0 64 64"
    role="img"
    aria-label="VEYRON monogram"
  >
    <polygon
      fill="currentColor"
      points="14,14 32,48 50,14 42,14 32,26 22,14"
    />
  </svg>
);

export default VeyronMonogram;
