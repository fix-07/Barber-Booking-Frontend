import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loginWithGoogle } from "../../actions/authActions";

/**
 * "Sign in with Google" -- Google's own button, not a hand-drawn one.
 *
 * ==========================================================================
 *  WHY THIS IS GOOGLE'S BUTTON, NOT A VEYRON-STYLED ONE
 * ==========================================================================
 *
 * Google's branding guidelines require using their own button/logo assets
 * for a Google Sign-In integration, rather than a custom lookalike --
 * https://developers.google.com/identity/branding-guidelines. So this
 * renders it with Google's own script (`renderButton`) rather than
 * building something from lucide-react icons the way every other button in
 * this app is built. It IS themed dark (`theme: "filled_black"`) so it
 * does not look like a foreign object dropped onto the page, which is the
 * one degree of customisation Google's own API actually offers.
 *
 * ==========================================================================
 *  THE ONE THING ON THIS PAGE THAT TALKS TO ANOTHER COMPANY
 * ==========================================================================
 *
 * Every other script and font on this site is served from this app's own
 * origin -- see the privacy note in public/index.html. This component is
 * the sole, deliberate exception: it loads Google's own script from
 * accounts.google.com, and only on the pages that render it (sign in,
 * customer sign up), never anywhere else. Disclosed in
 * config/business.js's appFacts.thirdPartyEmbeds, which both the Cookie
 * Policy and Privacy Policy read from directly -- change one place, both
 * pages update.
 *
 * ==========================================================================
 *  MODE: "signin" vs "signup", AND WHY THAT AFFECTS CONSENT
 * ==========================================================================
 *
 * A Google account picker has no way to ask "are you new here?" -- the
 * SAME button click can turn out to be a returning user (fine, no new
 * agreement needed) or a brand-new one (needs to have agreed to the Terms
 * and Privacy Policy first, exactly like every other way an account gets
 * created in this app -- see the comment on this in
 * controllers/googleAuthController.js).
 *
 *   mode="signup"  (CustomerSignupPage.js) shows a real, unticked
 *                  checkbox and refuses to even ask Google to sign someone
 *                  in until it is ticked. This is where creating a NEW
 *                  account is the expected outcome, so it is the one place
 *                  consent is actually collected.
 *
 *   mode="signin"  (LoginPage.js) shows no checkbox at all -- this page is
 *                  for existing users, and making every returning user
 *                  tick a box again just to sign back in would be exactly
 *                  the friction this button exists to remove. If Google
 *                  hands back an identity with no matching account, the
 *                  server correctly refuses to create one with no consent
 *                  on file, and this component shows a plain link to
 *                  customer sign-up instead of a dead-end error.
 */
let scriptPromise = null;

const loadGoogleScript = () => {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Google Sign-In."));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

const GoogleSignInButton = ({ mode = "signin", consentGiven = false }) => {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [error, setError] = useState("");

  /**
   * `loginWithGoogle` catches its own request errors and dispatches a
   * FAILURE action rather than rejecting -- consistent with every other
   * auth thunk in this app, so the pattern of reading errors from Redux
   * (not a rejected promise) is uniform across the whole auth surface.
   * That means the "you don't have an account yet" case has to be
   * detected here by reading the field error the server sent back, not by
   * catching a rejection that will never happen.
   */
  const acceptedPoliciesError = useSelector(
    (state) => state.auth.fieldErrors.acceptedPolicies
  );
  const needsAccount = mode === "signin" && Boolean(acceptedPoliciesError);

  // The callback below is set once at initialize() time, but consentGiven
  // can change afterwards (the person ticks the box after the button has
  // already rendered) -- a ref keeps the callback reading the CURRENT
  // value rather than the one that existed at initialize() time.
  const consentRef = useRef(consentGiven);
  consentRef.current = consentGiven;

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Not configured for this deployment: render nothing, rather than a
    // button that can only ever fail. See server/.env's matching
    // GOOGLE_CLIENT_ID comment for how to set this up.
    if (!clientId) return undefined;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          // Google hands the ID token to this callback. We do not verify
          // anything here -- verification happens exactly once, server
          // side, in controllers/googleAuthController.js. A token this
          // callback simply forwards could be anything; nothing acts on
          // it as if it were trusted until the server has checked it.
          callback: (response) => {
            setError("");

            if (mode === "signup" && !consentRef.current) {
              setError("Please agree to the Terms of Service and Privacy Policy first.");
              return;
            }

            dispatch(loginWithGoogle(response.credential, mode === "signup"));
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "rectangular",
          text: mode === "signup" ? "signup_with" : "continue_with",
          width: 360,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Could not load Google Sign-In.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [clientId, dispatch, mode]);

  if (!clientId) return null;

  return (
    <div className="bb-google-signin">
      {/* Google's script replaces the contents of this div with its own
          button -- nothing here is styled by our own CSS. */}
      <div ref={containerRef} />

      {needsAccount && (
        <p className="bb-google-signin-error v-dim">
          You don't have a VEYRON account yet.{" "}
          <Link to="/signup/customer" className="bb-auth-link">
            Create one with Google
          </Link>
          .
        </p>
      )}

      {error && !needsAccount && (
        <p className="bb-google-signin-error v-dim">{error}</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
