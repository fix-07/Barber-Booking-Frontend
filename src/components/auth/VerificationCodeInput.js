import React, { useId } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * The 6-digit code field.
 *
 * ==========================================================================
 *  ONE INPUT, NOT SIX BOXES
 * ==========================================================================
 *
 * The six-separate-boxes pattern looks appealing and is a well-known
 * accessibility and usability trap:
 *
 *   - Pasting a code from an email usually fills only the first box, or
 *     scatters wrongly, because each box takes one character.
 *   - Screen readers announce six unlabelled fields and give no sense of
 *     the whole value; corrections mean hunting for the right box.
 *   - Backspace behaviour has to be hand-written and is nearly always
 *     subtly wrong at the boundaries.
 *   - Browser and OS autofill of one-time codes targets a single field.
 *
 * So this is one input, letter-spaced so it still READS as six characters.
 * autoComplete="one-time-code" and inputMode="numeric" are what let a phone
 * or password manager offer the code directly.
 *
 * Non-digits are stripped on the way in and the length is capped at 6, so
 * the field cannot hold a value the server would reject for shape -- the
 * same `.replace(/\D/g, '').slice(0, 6)` the supplied AuthForm used.
 */
const VerificationCodeInput = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "6-digit code",
}) => {
  const reactId = useId();
  const inputId = `code-${reactId}`;
  const errorId = `${inputId}-error`;

  const handleChange = (event) => {
    onChange(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div className="bb-authfield">
      <label className="bb-authfield-label" htmlFor={inputId}>
        {label}
      </label>

      <input
        id={inputId}
        className={"bb-code-input" + (error ? " is-invalid" : "")}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        // Lets the browser and the OS offer a code they have just seen.
        // Harmless when nothing is available.
        maxLength={6}
        placeholder="••••••"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <p className="bb-authfield-error" id={errorId}>
          <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
