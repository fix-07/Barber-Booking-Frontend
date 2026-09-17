import React from "react";
import { isPlaceholder } from "../config/business";

/**
 * Shows a business detail. If it is still an unedited placeholder, it is
 * highlighted on screen AND announced to a screen reader as missing.
 *
 * WHY BOTHER: the alternative is a live site telling real customers to
 * "Contact us at [BUSINESS EMAIL]". Making it loud means you cannot publish it
 * by accident.
 *
 * NAMING WARNING, worth knowing about:
 * The CSS class is .bb-needs-filling, NOT .placeholder. Bootstrap already owns
 * .placeholder for its loading-skeleton component, which paints the element as
 * a solid block of colour. Reusing that name would have made every unfilled
 * business detail render as an invisible grey bar, which is the exact opposite
 * of what this component is for. This is the sort of collision to watch for
 * whenever you add a CSS framework to existing code.
 */
const Placeholder = ({ value }) => {
  if (!isPlaceholder(value)) return <>{value}</>;

  return (
    <span className="bb-needs-filling">
      {value}
      <span className="visually-hidden">
        {" "}
        (this detail still needs to be filled in)
      </span>
    </span>
  );
};

export default Placeholder;
