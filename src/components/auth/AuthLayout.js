import React from "react";
import { Link } from "react-router-dom";

/**
 * The split-screen shell every authentication screen sits in.
 *
 * LEFT   a composed brand panel, different per flow.
 * RIGHT  the form.
 *
 * Below 992px the split collapses: the panel becomes a compact header and
 * the form takes the full width, which is what the brief asks for and also
 * the only sensible thing on a phone.
 *
 * ==========================================================================
 *  WHY THERE IS NO PHOTOGRAPH HERE
 * ==========================================================================
 *
 * The brief asks for "a carefully composed barber/grooming photograph OR
 * visual treatment", and rules out "a generic stock-photo hero with text
 * slapped on top". This is the visual-treatment option, chosen because the
 * photograph option is not honestly available:
 *
 *   - A stock photo of a barbershop is a picture of a business that is not
 *     on this platform, presented as if it represents it.
 *   - An AI-generated one is a picture of a barber who does not exist.
 *   - One taken from a search is someone else's copyright.
 *
 * The same reasoning already governs BarberCard.js and the homepage. When
 * real barbers upload real photos of their own shops, there will be
 * genuine photography to use here -- and it will be theirs, with the
 * licensing question answered by the fact that they uploaded it.
 *
 * So the panel is built from type, rule and space: an oversized serif
 * statement, a hairline index of what the platform actually does, and the
 * mark. Editorial composition rather than decoration -- no cartoon
 * scissors, no barber pole, which the brief rules out and which would
 * undercut the tone anyway.
 */

/**
 * Per-flow content. Each entry is the statement the left panel makes.
 *
 * `index` lines are plain statements of fact about the product -- the same
 * standard as everywhere else on the site. None is a metric, a count, or a
 * claim about popularity, because all of those would be invented.
 */
const PANELS = {
  signin: {
    eyebrow: "The art of the cut",
    statement: ["Discover professionals.", "Book with confidence."],
    index: [
      "Browse barbers and their real prices",
      "See the times they are genuinely free",
      "Book without a phone call",
    ],
  },
  customer: {
    eyebrow: "Find your next barber",
    statement: ["Book your next cut", "with confidence."],
    index: [
      "Compare services and prices up front",
      "Choose from real available times",
      "Keep every booking in one place",
    ],
  },
  barber: {
    eyebrow: "Put your craft on the map",
    statement: ["Join the network", "and let customers", "discover your work."],
    index: [
      "Build a profile customers can find",
      "Set your own hours and prices",
      "Confirm every booking yourself",
    ],
  },
};

const AuthLayout = ({ variant = "signin", children, wide = false }) => {
  const panel = PANELS[variant] || PANELS.signin;

  return (
    <div className={"bb-auth" + (wide ? " bb-auth-wide" : "")}>
      {/*
        aria-hidden: this panel is presentation. Everything it says is
        marketing copy that repeats what the form and the rest of the site
        already state, so reading it aloud before every login form would be
        noise between the person and the thing they came to do.
      */}
      <aside className={`bb-auth-brand bb-auth-brand-${variant}`} aria-hidden="true">
        <div className="bb-auth-brand-inner">
          <Link to="/" className="bb-auth-mark" tabIndex={-1}>
            <svg width="22" height="22" viewBox="0 0 64 64" focusable="false">
              <rect x="14" y="17" width="36" height="7" rx="2" fill="#C8A96A" />
              <rect x="17" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="25" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="33" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="41" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            </svg>
            <span>VEYRON</span>
          </Link>

          <div className="bb-auth-statement">
            <p className="bb-auth-eyebrow">{panel.eyebrow}</p>
            <p className="bb-auth-headline">
              {panel.statement.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>

          <ul className="bb-auth-index">
            {panel.index.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/*
        A <section>, not a <main>. App.js already renders one <main
        id="main-content"> that every route sits inside, and a second one
        here would mean two <main> landmarks and a duplicate id on the same
        page -- which breaks the skip link (it would jump to whichever the
        browser found first) and gives assistive technology two "main"
        regions to choose between.
      */}
      <section className="bb-auth-panel">
        <div className="bb-auth-panel-inner">
          {/* On a phone the brand panel above is hidden, so this is the
              only thing that says whose site this is. */}
          <Link to="/" className="bb-auth-mark bb-auth-mark-mobile">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <rect x="14" y="17" width="36" height="7" rx="2" fill="#C8A96A" />
              <rect x="17" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="25" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="33" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="41" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            </svg>
            <span>VEYRON</span>
          </Link>

          {children}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
