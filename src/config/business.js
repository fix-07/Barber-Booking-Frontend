/**
 * ============================================================
 *  EDIT THIS FILE. It is the only place business details live.
 * ============================================================
 *
 * `name` and `legalName` are set to VEYRON, the platform's actual brand
 * name. Every other value below is still a PLACEHOLDER. I do not know your
 * real contact/registration details and inventing them would be worse than
 * leaving them blank, so they are written in square brackets and shown on
 * the site with a yellow highlight. You cannot miss them.
 *
 * The footer, the Privacy Policy, the Terms, the Cookie Policy and the
 * Refund Policy all read from here, so changing a value once updates it
 * everywhere.
 *
 * WHAT EACH FIELD IS FOR, and why it matters legally:
 *
 *  name          The name customers deal with.
 *  legalName     The registered company or sole-trader name, if different.
 *                Many places require the real trading identity to be
 *                findable on the site.
 *  email         A working contact address. Data protection rules in many
 *                places require a route for people to ask about their data,
 *                so this one is not optional in practice.
 *  phone         A working contact number for the business itself, shown in
 *                the footer. Not the same thing as an account's own phone
 *                number -- see models/User.js for that.
 *  address       A real postal address. Often required for consumer-facing
 *                businesses, and needed if you ever take payments.
 *  registration  Company or tax registration number, where you have one.
 *  hours         Your own opening hours, as free text.
 *  jurisdiction  The country (and state/province if relevant) whose law
 *                governs your Terms. THIS ONE NEEDS A REAL ANSWER and a
 *                lawyer's confirmation. See the note below.
 *  policyUpdated The date you last reviewed your policies.
 *
 * ------------------------------------------------------------
 *  IMPORTANT, PLEASE READ
 * ------------------------------------------------------------
 * I am not a lawyer and this is not legal advice. The policy pages on this
 * site are a plain-language starting point written from what the code
 * actually does. They are NOT a guarantee of compliance with any law.
 *
 * Which rules apply to you depends on things I cannot know: where your
 * business is based, where your customers are, whether you take payments,
 * and what third-party services you add later. Have a qualified local
 * lawyer or legal professional review all four policy pages before you
 * rely on them.
 */

const business = {
  name: "VEYRON",
  legalName: "VEYRON",
  email: "[BUSINESS EMAIL]",
  phone: "[BUSINESS PHONE]",
  address: "[BUSINESS ADDRESS]",
  registration: "[COMPANY OR TAX REGISTRATION NUMBER, IF ANY]",
  hours: "[BUSINESS HOURS]",

  // Example of a real value once you know it: "England and Wales"
  jurisdiction: "[APPLICABLE JURISDICTION]",

  // Example of a real value: "1 March 2026"
  policyUpdated: "[DATE YOU LAST REVIEWED THESE POLICIES]",
};

/**
 * True while a value is still an unedited placeholder.
 * Used to highlight it on the page so it cannot be published unnoticed.
 */
export const isPlaceholder = (value) =>
  typeof value === "string" && value.trim().startsWith("[");

/**
 * ------------------------------------------------------------
 *  FACTS ABOUT THIS APPLICATION
 * ------------------------------------------------------------
 * These are not placeholders. They describe what the code genuinely does
 * today, and the policy pages quote them.
 *
 * KEEP THIS HONEST. If you add analytics, a payment provider, an embedded
 * map or a marketing email tool, change the matching value here AND update
 * the policy text. A policy that describes the wrong thing is worse than no
 * policy, because it is a statement to your customers that is not true.
 */
export const appFacts = {
  // Nothing in the code charges anyone. Bookings record a price so both
  // sides know the agreed amount; no card details are collected anywhere.
  takesOnlinePayments: false,

  // No Google Analytics, no Meta Pixel, no tracking scripts of any kind.
  hasAnalytics: false,

  // One cookie only: the login token. It is strictly necessary for the site
  // to work and is not used for tracking or advertising.
  cookiesUsed: ["token"],

  // No Google Fonts, no maps, no embedded video, no social widgets, no CDN
  // -- with ONE deliberate exception, added when Google Sign-In was:
  // Google's own script for the "Sign in with Google" button. It loads
  // only on the pages that show that button (sign in, customer sign up),
  // never elsewhere, and only to let Google's OWN button run -- this app's
  // server never sees anything from it except the one-time confirmation
  // that a sign-in happened. See components/auth/GoogleSignInButton.js.
  thirdPartyEmbeds: [
    {
      name: "Google Identity Services",
      domain: "accounts.google.com",
      purpose:
        "Powers the \"Sign in with Google\" button, so you can create an account or sign in using your existing Google account instead of a new password.",
      when: "Only on the sign-in and customer sign-up pages, and only if Google Sign-In is configured for this deployment.",
    },
  ],

  // A booking starts as "awaiting confirmation" and is only agreed once the
  // barber confirms it. This matters for your Terms.
  bookingsNeedBarberConfirmation: true,

  // Personal data the app stores. Used by the Privacy Policy so the list
  // cannot drift away from the real database.
  personalDataStored: [
    "Name",
    "Email address",
    "Password (stored only as a bcrypt hash, never the password itself)",
    "Phone number",
    "Account type (customer, barber, or admin for shop staff)",
    "Record that you agreed to the policies, and when",
    "Your bookings: date, time, service, price agreed, and any note you add",
    "Whether a booking's payment was recorded as received, and by which " +
      "method (cash or card) -- there is no online payment processor, so " +
      "no card details are ever collected; this only records that payment " +
      "happened in person",
    "For staff accounts: internal notes staff may keep about a client " +
      "(for example a preference or a past issue), visible only to staff, " +
      "never to the client themselves",
  ],

  // Extra data a barber chooses to publish about their shop.
  barberDataStored: [
    "Shop or business name",
    "Town or city",
    "Street address (optional)",
    "A contact phone number the barber chooses to publish (optional)",
    "Shop description (optional)",
    "Opening hours and shop timezone",
    "Services offered, with duration and price",
  ],
};

export default business;
