import React from "react";
import { NavLink } from "react-router-dom";

/**
 * The centered card that both the login and register pages sit inside.
 *
 * ============================================================
 *  WHAT THIS REPLACES
 * ============================================================
 * This replaces the earlier two-column "branded panel beside the form"
 * layout (the old AuthPanel.js, removed). That version put a dark panel on
 * the left and a white form on the right. This puts one dark card, centered
 * on a dark page, with a Log In / Sign Up switcher at the top -- closer to
 * the reference design the user pointed at.
 *
 * ============================================================
 *  THE SWITCHER LOOKS LIKE TABS. IT IS NOT AN ARIA TABLIST.
 * ============================================================
 * Clicking "Sign Up" while looking at "Log In" sends the browser to a
 * DIFFERENT ROUTE (/register), which is a different page with a different
 * set of fields, not the same panel swapped in place. A true ARIA tablist
 * promises something specific to assistive technology: arrow keys move
 * between tabs, and the content changes without the URL changing. Neither
 * is true here, so role="tab" would describe behaviour that does not exist.
 *
 * The honest pattern for "this looks like a tab but is really a link to
 * another page" is exactly what the site header already uses: NavLink,
 * which sets aria-current="page" on whichever one you are on. That is what
 * is happening -- you are on one of two pages -- and it is announced the
 * same way navigation is announced everywhere else on this site.
 *
 * ============================================================
 *  WHAT DID NOT COME BACK FROM THE REFERENCE DESIGN, AND WHY
 * ============================================================
 * No GitHub or Google buttons: this app has no OAuth, and a button that
 * does nothing is a lie to whoever clicks it.
 *
 * No "Remember me": no such feature exists behind it.
 *
 * No "Forgot password?" link: there is no password-reset flow yet. A dead
 * link is worse than no link at all -- someone locked out of their account
 * clicks it expecting help and gets nothing.
 *
 * No particle canvas or animated grid lines: an unbounded
 * requestAnimationFrame loop redrawing hundreds of points forever, with no
 * prefers-reduced-motion check, is exactly the kind of animation this
 * project's brief rules out.
 *
 * These were declined the first time this component came up, on request,
 * and stay declined here: this pass is the layout only.
 */
const AuthCard = ({ children }) => (
  <div className="bb-auth-page">
    <div className="bb-auth-card">
      {/* Not a tablist -- see the note above. Styled to look like a
          segmented switcher, but each option is a real link to a real
          page. */}
      <nav className="bb-auth-switcher" aria-label="Log in or create an account">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            "bb-auth-tab" + (isActive ? " is-active" : "")
          }
        >
          Log In
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) =>
            "bb-auth-tab" + (isActive ? " is-active" : "")
          }
        >
          Sign Up
        </NavLink>
      </nav>

      <div className="bb-auth-card-body">{children}</div>
    </div>
  </div>
);

export default AuthCard;
