/**
 * Is this path one of the full-screen authentication pages?
 *
 * Those pages are their own self-contained layout -- a split screen that
 * fills the viewport, with the brand on one side and the form on the other
 * (see components/auth/AuthLayout.js). The site header and footer must not
 * render around them: a nav bar stacked on top would push the split screen
 * down and leave it no longer filling the height, and a footer under it
 * would add a second place the brand appears.
 *
 * This is the same arrangement the admin section already uses, where
 * Header and Footer return null for any /admin path because the admin
 * shell provides its own chrome.
 *
 * Kept in one file so Header.js and Footer.js cannot drift apart on which
 * routes count -- a header that hid itself on a route the footer still
 * rendered on would be a subtle, annoying bug.
 */

const AUTH_PREFIXES = [
  "/welcome",
  "/login",
  "/register",
  "/signup",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/complete-profile",
];

export const isAuthRoute = (pathname) =>
  AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export default isAuthRoute;
