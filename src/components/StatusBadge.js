import React from "react";
import { Badge } from "react-bootstrap";

import { describeStatus } from "../utils/format";

/**
 * Shows a booking status, using React Bootstrap's Badge.
 *
 * THE RULE THIS ENFORCES: never use colour alone to tell someone something.
 *
 * A cancelled booking does not simply turn red. It reads "Cancelled by
 * customer" as actual text, tinted red as a secondary hint. That works in
 * greyscale, for a colour-blind reader, when printed, and when read aloud.
 *
 * WHY bg="" AND NOT bg="danger":
 * Bootstrap's own badge colours are solid fills chosen for contrast against
 * white text, and "danger" would make a cancelled booking a loud red block.
 * Passing an empty bg stops Bootstrap painting its own background, so our
 * softer .bb-badge-* classes from theme.css apply instead. Those were measured
 * between 5.05:1 and 7.93:1.
 */
const StatusBadge = ({ status }) => {
  const { label, className, explanation } = describeStatus(status);

  return (
    <Badge
      bg=""
      className={`bb-badge ${className}`}
      title={explanation || undefined}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
