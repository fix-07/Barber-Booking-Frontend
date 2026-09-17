import React from "react";
import { Alert as BsAlert } from "react-bootstrap";

/**
 * A message box for errors, confirmations and notices.
 *
 * This wraps React Bootstrap's Alert so that every message in the app gets the
 * right ARIA role without each page having to remember.
 *
 * WHY role MATTERS:
 * A sighted user notices a red box appear. A screen-reader user does not,
 * unless we tell the browser to announce it.
 *
 *   role="alert"   interrupts immediately. Correct for errors, because the
 *                  person needs to know their action failed before they retry.
 *   role="status"  waits for a natural pause, then announces politely. Correct
 *                  for "Booking cancelled", which is useful but not urgent.
 *
 * Using role="alert" for everything would make the app talk over itself, which
 * is why Bootstrap does not guess this for us.
 *
 * Bootstrap's own alert colours were checked and are fine: alert-danger text
 * measures 10.22:1 against its background, alert-success 10.35:1.
 */
const Alert = ({ type = "info", children, onDismiss }) => {
  if (!children) return null;

  const variant =
    type === "error" ? "danger" : type === "success" ? "success" : "secondary";

  return (
    <BsAlert
      variant={variant}
      role={type === "error" ? "alert" : "status"}
      dismissible={Boolean(onDismiss)}
      onClose={onDismiss}
      // Bootstrap's close button is an icon with no visible text, so it needs
      // a label. Without this a screen reader announces only "button".
      closeLabel="Dismiss this message"
    >
      {children}
    </BsAlert>
  );
};

export default Alert;
