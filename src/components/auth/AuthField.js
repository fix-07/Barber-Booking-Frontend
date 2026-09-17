import React, { useId, useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

/**
 * One input on an authentication screen: leading icon, optional show/hide
 * toggle, and an error message tied to the field.
 *
 * PORTED FROM THE SUPPLIED AuthForm -- the icon-inside-the-input layout,
 * the Eye/EyeOff toggle and the AlertTriangle error line are all from it.
 *
 * ==========================================================================
 *  WHAT CHANGED, AND WHY IT HAD TO
 * ==========================================================================
 *
 * The original labelled its inputs with `placeholder` plus `aria-label`.
 * That is the one thing from it I have not carried over, because the brief
 * itself rules it out: "Every input needs a proper label... Do not rely
 * only on placeholder text."
 *
 * It matters beyond compliance. A placeholder disappears the moment you
 * type, so anyone who is interrupted mid-form loses the only thing telling
 * them what the field was. It is also frequently too low-contrast to read,
 * and voice-control users cannot say "click Email Address" if no visible
 * label says those words.
 *
 * So every field here has a real <label> pointing at the input by id. The
 * placeholder stays as an example of the format, never as the name.
 *
 * ==========================================================================
 *  THE ERROR ASSOCIATION
 * ==========================================================================
 *
 * aria-describedby links the message to the input, and aria-invalid marks
 * the field. Without the pair, a screen-reader user hears "Email Address,
 * edit text" and is never told what is wrong with it -- the red text is
 * visually adjacent but programmatically unrelated. useId generates ids
 * that are unique per instance, so two of these on one page cannot collide.
 */
const AuthField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  hint,
  icon: Icon,
  autoComplete,
  placeholder,
  required = false,
  inputMode,
  maxLength,
  disabled = false,
  as,
  rows,
}) => {
  const reactId = useId();
  const inputId = `${name}-${reactId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  // A revealed password is a plain text field; everything else keeps its
  // own type so the right mobile keyboard and browser autofill still apply.
  const resolvedType = isPassword && revealed ? "text" : type;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const Control = as === "textarea" ? "textarea" : "input";

  return (
    <div className="bb-authfield">
      <label className="bb-authfield-label" htmlFor={inputId}>
        {label}
        {required && (
          <span className="bb-authfield-required" aria-hidden="true">
            *
          </span>
        )}
        {/* Spelled out for anyone hearing the form, since a bare asterisk
            is announced as "star" or skipped entirely. */}
        {required && <span className="visually-hidden"> (required)</span>}
      </label>

      <div
        className={
          "bb-authfield-control" +
          (error ? " is-invalid" : "") +
          (Icon ? " has-icon" : "") +
          (isPassword ? " has-toggle" : "") +
          (as === "textarea" ? " is-textarea" : "")
        }
      >
        {Icon && (
          <span className="bb-authfield-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
          </span>
        )}

        <Control
          id={inputId}
          name={name}
          type={as === "textarea" ? undefined : resolvedType}
          rows={as === "textarea" ? rows || 3 : undefined}
          className="bb-authfield-input"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
        />

        {isPassword && (
          <button
            type="button"
            className="bb-authfield-toggle"
            onClick={() => setRevealed((shown) => !shown)}
            // The label changes with the state, so the button always
            // announces what pressing it will DO, not what it just did.
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            disabled={disabled}
          >
            {revealed ? (
              <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p className="bb-authfield-hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="bb-authfield-error" id={errorId}>
          <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default AuthField;
