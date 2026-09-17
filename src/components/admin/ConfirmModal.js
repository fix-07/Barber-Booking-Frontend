import React from "react";
import { Modal, Button } from "react-bootstrap";

/**
 * A generic "are you sure" dialog for a destructive admin action --
 * deleting a client, deleting a barber, and anywhere else a confirm step
 * is genuinely needed. Kept plain (title + body + one confirm button)
 * rather than baked into any one delete flow, now that there are two real
 * uses of the exact same shape (see the note in MyBookingsPage.js on why
 * an inline confirm step is used there instead of a browser confirm() --
 * same reasoning applies here, just as a shared modal instead of inline
 * per-page state, since this needs to work identically from both a list
 * row and a detail page).
 */
const ConfirmModal = ({
  show,
  title,
  body,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isConfirming = false,
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} onHide={onCancel} centered>
    <Modal.Header closeButton>
      <Modal.Title as="h2" className="h5 mb-0">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="outline-dark" onClick={onCancel} disabled={isConfirming}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} disabled={isConfirming}>
        {isConfirming ? "Working..." : confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
