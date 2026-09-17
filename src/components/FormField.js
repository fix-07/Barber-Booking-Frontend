import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";

import { ClearIcon } from "./formIcons";

/**
 * One labelled form field, built from React Bootstrap's Form components.
 *
 * WHY THIS WRAPPER EXISTS RATHER THAN USING Form.Group DIRECTLY EVERYWHERE:
 * getting a field fully accessible takes five separate pieces, and doing it by
 * hand on every page is how one of them eventually gets forgotten. Wrapping it
 * once means every field in the app is correct by default.
 *
 * WHAT BOOTSTRAP GIVES US:
 *
 *   Form.Group controlId="email"
 *     wires the <label for> to the input's id automatically, so we cannot
 *     mismatch them.
 *
 *   isInvalid + Form.Control.Feedback type="invalid"
 *     shows the error message and turns the border red.
 *
 *   Form.Text
 *     renders the hint in muted text.
 *
 * WHAT BOOTSTRAP DOES **NOT** GIVE US, WHICH CAUGHT ME OUT:
 *
 *   `isInvalid` adds ONLY the CSS class `is-invalid`. It does not set
 *   aria-invalid, and it does not connect the error message to the input.
 *   I checked this in the live DOM: a field showing a red border and an error
 *   message underneath had aria-invalid="null" and no aria-describedby.
 *
 *   The practical effect is that the error is purely visual. Someone using a
 *   screen reader tabs into the field, hears the label, and is told nothing
 *   about what went wrong or even that anything is wrong.
 *
 *   So we set both ourselves, below:
 *     - aria-invalid="true" while there is an error
 *     - aria-describedby pointing at the hint AND the error message, so both
 *       are read out as part of the field
 *
 * ONE RULE WE KEEP FROM BEFORE: no placeholder text used as a label. A
 * placeholder disappears the moment someone types, so they lose the question
 * while answering it, and it is low contrast in most browsers.
 *
 * THE OPTIONAL `icon` PROP: a small decorative glyph on the left of the
 * field (mail, lock, and so on -- see components/authIcons.js). It shares
 * the same position:relative wrapper the password toggle uses, so a
 * password field can have a lock icon on the left and the reveal button on
 * the right at the same time. See styles/forms.css for .bb-field-wrap.
 *
 * THE OPTIONAL `onClear` PROP: turns this into a search-style field with a
 * clear ("x") button on the right, shown only once there is something to
 * clear. It sits in the same right-hand slot as the password toggle -- a
 * field is never both, so they never collide. Clearing moves focus back to
 * the input, since the button then disappears from under the pointer.
 */

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.3 4M6.2 7.9A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 3.4-.62" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
  </svg>
);

const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  required = false,
  autoComplete,
  inputMode,
  min,
  max,
  step,
  rows,
  disabled = false,
  as,
  children,
  // Optional leading icon (a small SVG element, e.g. <MailIcon />).
  // Decorative only -- see the note below on why it carries no aria-label.
  icon,
  // Optional: makes this a clearable search-style field. Called with no
  // arguments when the clear button is pressed -- the caller resets its own
  // state, the same way onChange hands control back to the caller.
  onClear,
}) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Point the field at whichever of these exist. undefined means "no
  // attribute", which is correct: an empty aria-describedby points at nothing.
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  /**
   * Show / hide password.
   *
   * Only appears on password fields. People mistype passwords constantly, and
   * on a phone keyboard they cannot see what they typed, so being able to
   * check is often the difference between logging in and being locked out.
   *
   * Three details that make it accessible rather than decorative:
   *   - it is a real <button type="button">, so Tab reaches it and it does NOT
   *     submit the form (a bare <button> inside a form defaults to submit)
   *   - the aria-label changes with the state, so a screen reader announces
   *     "Show password" or "Hide password" rather than just "button"
   *   - aria-pressed marks it as a toggle that stays on
   *
   * Note it flips the input to type="text" while revealed. That is the only
   * way to show the characters, and it is why the button says plainly what it
   * is about to do.
   */
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  const resolvedType = isPassword && revealed ? "text" : type;

  // Only relevant when onClear is passed. Lets the clear button return focus
  // to the field once it removes itself from under the pointer.
  const controlRef = useRef(null);
  const showClear = Boolean(onClear) && Boolean(value);

  // Both the leading icon and the password toggle / clear button live in the
  // same position:relative wrapper, so a field can have an icon on the left
  // AND a button on the right at once. A field with neither renders the
  // plain control with no extra markup. A field is never both a password
  // field and a clearable search field, so their right-hand slot (has-toggle)
  // is shared without ever needing both at once.
  const hasIcon = Boolean(icon);
  const needsWrapper = hasIcon || isPassword || showClear;
  const wrapperClassName = [
    "bb-field-wrap",
    hasIcon && "has-icon",
    (isPassword || showClear) && "has-toggle",
  ]
    .filter(Boolean)
    .join(" ");

  const control = (
    <Form.Control
      // `as` lets a page pass "textarea" or "select" and reuse all of this.
      as={as || (type === "textarea" ? "textarea" : "input")}
      type={type === "textarea" ? undefined : resolvedType}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      inputMode={inputMode}
      min={min}
      max={max}
      step={step}
      rows={as === "textarea" || type === "textarea" ? rows || 4 : undefined}
      isInvalid={Boolean(error)}
      // Set explicitly. react-bootstrap does not add these.
      aria-invalid={error ? "true" : undefined}
      aria-describedby={describedBy}
      ref={onClear ? controlRef : undefined}
    >
      {children}
    </Form.Control>
  );

  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="fw-semibold">
        {label}
        {required && (
          <>
            {" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
            <span className="visually-hidden">(required)</span>
          </>
        )}
      </Form.Label>

      {/* The hint comes BEFORE the input so it is read as part of the question
          rather than after the answer has been given. */}
      {hint && (
        <Form.Text id={hintId} className="d-block mb-2">
          {hint}
        </Form.Text>
      )}

      {needsWrapper ? (
        <div className={wrapperClassName}>
          {/* Decorative: the field's own <label> already says what this
              input is for, so this carries no aria-label of its own. */}
          {hasIcon && (
            <span className="bb-field-icon" aria-hidden="true">
              {icon}
            </span>
          )}

          {control}

          {isPassword && (
            <button
              type="button"
              className="bb-password-toggle"
              onClick={() => setRevealed((shown) => !shown)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              disabled={disabled}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}

          {showClear && (
            <button
              type="button"
              className="bb-field-clear"
              onClick={() => {
                onClear();
                controlRef.current?.focus();
              }}
              aria-label={`Clear ${label}`}
              disabled={disabled}
            >
              <ClearIcon />
            </button>
          )}

          {/* Bootstrap only displays this when isInvalid is true. The id is
              what aria-describedby above points at, which is what actually
              connects it to the field for assistive technology. d-block is
              needed because it sits inside the relative wrapper. */}
          <Form.Control.Feedback type="invalid" className="d-block" id={errorId}>
            {error}
          </Form.Control.Feedback>
        </div>
      ) : (
        <>
          {control}
          <Form.Control.Feedback type="invalid" id={errorId}>
            {error}
          </Form.Control.Feedback>
        </>
      )}
    </Form.Group>
  );
};

export default FormField;
