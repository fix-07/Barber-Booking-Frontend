/**
 * Turning a phone number into a "Contact on WhatsApp" link.
 *
 * ==========================================================================
 *  "DO NOT INVENT A COUNTRY CODE" -- WHY THIS IS STRICT
 * ==========================================================================
 *
 * A number like "0612345678" could be a French mobile (+33 6...), a
 * Moroccan one (+212 6...), or plenty of others -- there is no way to tell
 * from the digits alone which country it belongs to. Guessing wrong sends
 * someone's WhatsApp message to a stranger, or to nobody. So this ONLY
 * accepts a number that already states its own country code, the same way
 * the international dialling system itself resolves ambiguity: a leading
 * "+", or the long-form "00" prefix used in many countries in place of it.
 *
 * A barber's `publicPhone` (see models/BarberProfile.js) is free text they
 * typed themselves -- there is no guarantee it includes a country code.
 * When it does not, this returns `null` and the button simply does not
 * render (see BarberDetailPage.js / BarberCard.js), rather than showing a
 * button that would message the wrong person.
 */

/**
 * Normalizes a phone number to the bare digits WhatsApp's link format
 * expects (E.164 without the "+"), or returns null if the number does not
 * unambiguously include a country code.
 */
export const normalizeForWhatsApp = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== "string") return null;

  let value = rawPhone.trim();

  // "00" is the international-dialling-prefix convention many countries
  // use in place of "+" (e.g. "0033 6..." for a French number dialled
  // from abroad) -- treat it the same as a leading "+".
  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  if (!value.startsWith("+")) return null; // no stated country code -- refuse to guess

  // Strip everything except digits from here on (spaces, hyphens,
  // parentheses), keeping only the digits after the leading "+".
  const digits = value.slice(1).replace(/\D/g, "");

  // E.164 numbers are 8-15 digits after the country code prefix, total.
  // Anything shorter is almost certainly a typo or a partial paste;
  // anything longer cannot be a real phone number.
  if (digits.length < 8 || digits.length > 15) return null;

  return digits;
};

/** Whether this number can safely show a WhatsApp button at all. */
export const isValidWhatsAppNumber = (rawPhone) => normalizeForWhatsApp(rawPhone) !== null;

/**
 * The wa.me link for this number, or null if it is not valid enough to
 * link -- callers must check for null and render nothing in that case
 * (see WhatsAppButton.js), never fall back to a broken link.
 *
 * `message` is optional pre-filled text the person can still edit or
 * clear before sending -- this NEVER sends anything automatically. Opening
 * this link only opens WhatsApp with a draft; nothing is transmitted until
 * the person themselves presses send there.
 */
export const getWhatsAppLink = (rawPhone, message) => {
  const digits = normalizeForWhatsApp(rawPhone);
  if (!digits) return null;

  const url = new URL(`https://wa.me/${digits}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
};
