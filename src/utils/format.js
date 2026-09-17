/**
 * Small formatting helpers, kept in one place so prices and dates look the
 * same everywhere in the app.
 */

/**
 * Turns 2500 + "GBP" into a properly formatted price.
 *
 * Remember the backend stores money as a whole number of minor units, so
 * 2500 means 25.00. We divide by 100 only here, at the moment of display.
 *
 * Intl.NumberFormat is built into the browser and knows where each currency
 * puts its symbol, so we are not hard-coding a "£" that would be wrong for
 * every other currency.
 */
export const formatMoney = (priceMinor, currency) => {
  if (priceMinor === null || priceMinor === undefined) return "";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(priceMinor / 100);
  } catch {
    // Unknown currency code: show the number and the code rather than
    // crashing or silently showing the wrong symbol.
    return `${(priceMinor / 100).toFixed(2)} ${currency || ""}`.trim();
  }
};

/**
 * "45" -> "45 min"   "90" -> "1 h 30 min"
 */
export const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  if (total < 60) return `${total} min`;

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

/**
 * Formats a stored date for a human.
 *
 * `timeZone` should be the SHOP'S timezone when showing an appointment, so a
 * customer who booked 10:00 in Manchester still sees 10:00 while they are on
 * holiday abroad. Leaving it out uses the viewer's own timezone.
 */
export const formatDateTime = (isoString, timeZone) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

/** Just the clock time, for the slot buttons. */
export const formatTimeOnly = (isoString, timeZone) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined,
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

/** Today as "YYYY-MM-DD", for the date input's minimum value. */
export const todayAsDateInput = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

/** A date N days from today as "YYYY-MM-DD", for the input's maximum. */
export const dateInputPlusDays = (days) => {
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const month = String(future.getMonth() + 1).padStart(2, "0");
  const day = String(future.getDate()).padStart(2, "0");
  return `${future.getFullYear()}-${month}-${day}`;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const dayName = (dayNumber) => DAY_NAMES[dayNumber] || "";

/**
 * Turns a status code into plain words plus a badge style.
 *
 * ACCESSIBILITY POINT:
 * `label` is the real message and is always shown as text. The CSS class only
 * tints it. That means the status still reads correctly in greyscale, for a
 * colour-blind visitor, and when a screen reader says it aloud. We never use
 * red alone to mean "rejected".
 */
export const describeStatus = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Awaiting confirmation",
        className: "bb-badge-pending",
        explanation: "The barber has not confirmed this appointment yet.",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bb-badge-confirmed",
        explanation: "The barber has confirmed this appointment.",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bb-badge-done",
        explanation: "This appointment has taken place.",
      };
    case "cancelled_by_customer":
      return {
        label: "Cancelled by customer",
        className: "bb-badge-cancelled",
        explanation: "The customer cancelled this appointment.",
      };
    case "cancelled_by_barber":
      return {
        label: "Cancelled by barber",
        className: "bb-badge-cancelled",
        explanation: "The barber cancelled this appointment.",
      };
    case "cancelled_by_admin":
      return {
        label: "Cancelled by staff",
        className: "bb-badge-cancelled",
        explanation: "VEYRON staff cancelled this appointment.",
      };
    case "no_show":
      return {
        label: "Marked as no-show",
        className: "bb-badge-muted",
        explanation: "The barber recorded that the customer did not attend.",
      };
    default:
      return {
        label: status || "Unknown",
        className: "bb-badge-muted",
        explanation: "",
      };
  }
};

/**
 * Same idea as describeStatus, for a booking's payment record (see
 * Booking.payment in server/models/Booking.js -- there is no payment
 * processor, this is staff recording cash/card taken in person). Reuses the
 * same five .bb-badge-* colour classes rather than inventing new ones.
 */
export const describePaymentStatus = (status) => {
  switch (status) {
    case "paid":
      return { label: "Paid", className: "bb-badge-confirmed" };
    case "refunded":
      return { label: "Refunded", className: "bb-badge-done" };
    case "failed":
      return { label: "Failed", className: "bb-badge-cancelled" };
    case "unpaid":
    default:
      return { label: "Unpaid", className: "bb-badge-muted" };
  }
};

/**
 * Works out whether a barber is open today, in THEIR timezone, and returns a
 * short line for the card.
 *
 * WHY THE TIMEZONE MATTERS HERE:
 * "today" is not the same day everywhere at once. A customer browsing at 23:30
 * in London is already on tomorrow in Karachi. Asking Intl what weekday it is
 * *at the shop* is the only way this line is correct for both of them.
 *
 * Returns { isOpen, label } so the caller can show a word, never a colour on
 * its own.
 */
export const todayHoursFor = (workingHours, timeZone) => {
  if (!Array.isArray(workingHours) || workingHours.length === 0) {
    return { isOpen: false, label: "Opening hours not set" };
  }

  let weekday;
  try {
    // "Mon", "Tue", ... as the clock reads at the shop.
    weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || undefined,
      weekday: "short",
    }).format(new Date());
  } catch {
    weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date());
  }

  const dayNumber = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday];
  const rule = workingHours.find((entry) => entry.day === dayNumber);

  if (!rule || !rule.isOpen) {
    return { isOpen: false, label: "Closed today" };
  }

  return { isOpen: true, label: `Open today ${rule.open} to ${rule.close}` };
};

/**
 * Turns a Date object into the "YYYY-MM-DD" string our availability endpoint
 * expects.
 *
 * WHY NOT date.toISOString().slice(0,10):
 * toISOString converts to UTC first. For anyone west of Greenwich, a date
 * picked at 8pm on the 20th becomes "2026-09-21" - the calendar would ask the
 * server about the wrong day, and the customer would see tomorrow's slots.
 * Reading the local parts avoids that entirely.
 */
export const dateToInputValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/** "2026-09-20" -> a Date at local midnight. Returns null if malformed. */
export const inputValueToDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;

  // Building it from parts (rather than new Date("2026-09-20")) keeps it at
  // LOCAL midnight. The string form is parsed as UTC, which shifts the day.
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};
