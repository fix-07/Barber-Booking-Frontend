import React from "react";
import { Badge } from "react-bootstrap";

import { describePaymentStatus } from "../../utils/format";

/**
 * Same pattern as components/StatusBadge.js, for a booking's payment status.
 * See describePaymentStatus for why it reuses the same badge colour classes.
 */
const PaymentStatusBadge = ({ status }) => {
  const { label, className } = describePaymentStatus(status);
  return (
    <Badge bg="" className={`bb-badge ${className}`}>
      {label}
    </Badge>
  );
};

export default PaymentStatusBadge;
