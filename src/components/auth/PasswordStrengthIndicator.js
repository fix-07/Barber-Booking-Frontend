import React from "react";
import { AlertTriangle, Check } from "lucide-react";

import {
  calculatePasswordStrength,
  strengthLabel,
  strengthVariant,
} from "../../auth/passwordStrength";

/**
 * The strength meter under a new-password field.
 *
 * PORTED FROM THE SUPPLIED AuthForm: same five-segment score, same
 * requirement wording, same "nothing until you start typing" behaviour.
 *
 * ==========================================================================
 *  THREE THINGS CHANGED
 * ==========================================================================
 *
 * 1. NOT COLOUR ALONE. The original showed strength as a coloured bar plus
 *    a word. This keeps the word (it is the real message) and adds discrete
 *    segments, so the level is readable from the FILLED COUNT even if every
 *    colour looks the same to you. A colour-blind user should not have to
 *    guess whether orange means weak or good.
 *
 * 2. ANNOUNCED, BUT NOT CONSTANTLY. The live region is polite and carries
 *    only the summary sentence, so a screen-reader user is told "Password
 *    strength: Fair" when they pause, rather than having every keystroke
 *    interrupt them.
 *
 * 3. MET REQUIREMENTS ARE SHOWN TOO, ticked. The original only listed what
 *    was still missing, which means the list silently shrinks as you type
 *    and you never get confirmation that something is now satisfied.
 *    Showing all five with their state is steadier to read and makes the
 *    rule set obvious up front.
 */

const REQUIREMENT_LABELS = [
  ["length", "At least 8 characters"],
  ["uppercase", "One uppercase letter"],
  ["lowercase", "One lowercase letter"],
  ["number", "One number"],
  ["special", "One special character"],
];

const PasswordStrengthIndicator = ({ password }) => {
  // Same as the original: the meter does not exist until there is
  // something to measure, so an untouched form is not covered in warnings.
  if (!password) return null;

  const { score, requirements } = calculatePasswordStrength(password);
  const variant = strengthVariant(score);
  const label = strengthLabel(score);

  return (
    <div className="bb-strength">
      <div className="bb-strength-row">
        <div
          className={`bb-strength-meter bb-strength-${variant}`}
          // The bar is decoration; the sentence below carries the meaning.
          aria-hidden="true"
        >
          {[1, 2, 3, 4, 5].map((segment) => (
            <span
              key={segment}
              className={
                "bb-strength-segment" + (segment <= score ? " is-filled" : "")
              }
            />
          ))}
        </div>
        <span className={`bb-strength-label bb-strength-${variant}`}>
          {label}
        </span>
      </div>

      <p className="visually-hidden" aria-live="polite">
        Password strength: {label}. {score} of 5 requirements met.
      </p>

      <ul className="bb-strength-list">
        {REQUIREMENT_LABELS.map(([key, text]) => {
          const met = requirements[key];
          return (
            <li
              key={key}
              className={"bb-strength-item" + (met ? " is-met" : "")}
            >
              {met ? (
                <Check size={13} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" />
              )}
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
