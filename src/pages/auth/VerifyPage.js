import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, AlertTriangle, ShieldCheck, Check } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import VerificationCodeInput from "../../components/auth/VerificationCodeInput";
import {
  sendVerificationCode,
  verifyAccount,
  verifyRegistrationCode,
  resendRegistrationCode,
} from "../../actions/verificationActions";
import { homeRouteFor } from "../../auth/roleRoutes";

/**
 * Account verification: enter the 6-digit code, or ask for a new one.
 *
 * ==========================================================================
 *  TWO DIFFERENT THINGS THIS SCREEN CAN BE VERIFYING
 * ==========================================================================
 *
 * A self-registered account no longer exists at all until this screen
 * succeeds -- registering only creates a PendingRegistration (see
 * server/controllers/pendingRegistrationController.js). So this screen has
 * to work with there being NO logged-in user yet, which is a real change
 * from a normal "verify your existing account" screen:
 *
 *   PENDING   no session. `email` comes from the verification slice
 *             (set by registering, moments ago) or from router state (a
 *             fallback for a reload -- see CustomerSignupPage.js /
 *             BarberSignupPage.js, which pass it the same way
 *             ResetPasswordPage.js already carries an email forward).
 *             Talks to the PUBLIC verify-registration / resend-
 *             registration-code endpoints, which take the email
 *             explicitly because there is no session to identify the
 *             attempt by. Success creates the account and logs it in.
 *
 *   ACCOUNT   a real, logged-in, but unverified account -- the one case
 *             left where this can still happen is one an admin created
 *             directly (see adminBarberController.createBarber), since
 *             that never goes through the pending-registration flow.
 *             Talks to the auth-gated send-verification / verify-account
 *             endpoints, exactly as this screen always has.
 *
 * Both end the same way: a real, verified, logged-in user in
 * `state.auth.user`, at which point the shared success screen and
 * homeRouteFor(user) below apply unchanged either way.
 *
 * ==========================================================================
 *  THE CODE GOES TO EMAIL, AND THE SCREEN SAYS SO
 * ==========================================================================
 *
 * The original spec described this as phone verification with a masked
 * phone number. Delivery is by email, so this screen says email and shows
 * the masked EMAIL the server echoed back. Saying "we sent a code to your
 * phone" while sending an email would be a straightforward lie to the
 * person using it, and they would sit waiting for a text that never comes.
 *
 * The masked address comes from the server (maskEmail in
 * verificationController.js). The client never composes it, so it cannot
 * accidentally show the full address of an account it should not know.
 *
 * ==========================================================================
 *  THE COUNTDOWN IS A MIRROR, NOT A RULE
 * ==========================================================================
 *
 * The 60-second wait is enforced on the server. This timer only reflects
 * it, so that the button is not offered while it would fail. Reloading the
 * page resets the timer but not the limit -- the server answers 429 with
 * the real number of seconds remaining, and that number is what restarts
 * the countdown.
 */
const VerifyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const {
    isSending,
    isVerifying,
    sentTo,
    pendingEmail,
    error,
    fieldErrors,
    expiresInMinutes,
    resendAfterSeconds,
  } = useSelector((state) => state.verification);

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [done, setDone] = useState(false);

  // See the header comment: an existing unverified account uses one pair
  // of endpoints, a pending (not-yet-real) registration uses another. This
  // is the one flag that decides which for the rest of the component.
  const isAccountMode = Boolean(user);
  const pendingRegistrationEmail =
    pendingEmail || (location.state && location.state.email) || null;

  // Guards React 18 StrictMode's deliberate double-effect in development
  // from firing two "send code" requests, which would immediately trip the
  // server's own 60-second cooldown and show a 429 on arrival.
  const askedOnce = useRef(false);

  /**
   * DELIBERATELY NO "clear verification state on unmount" effect here.
   *
   * There used to be one. It caused a real bug: React 18 StrictMode's
   * development-only double-invoke (mount -> cleanup -> mount again, to
   * surface exactly this kind of problem) fired that cleanup immediately
   * after the first mount, wiping `sentTo` a moment after the mount effect
   * below had just populated it from the registration response. The
   * countdown kept working because its seconds are local useState, not
   * Redux -- so the symptom was a page that counted down correctly while
   * showing "your email address" instead of the real masked address.
   *
   * The fix is not a StrictMode workaround: this screen is SUPPOSED to
   * keep using `sentTo` (and now `pendingEmail`) across a remount -- that
   * is the entire point of carrying them over from registration instead of
   * asking the server again (see the effect below). A genuine navigation
   * away from /verify already unmounts this component for real, which
   * resets `code`, `secondsLeft` and `askedOnce` on its own; nothing here
   * goes stale in a way that needs clearing, and no verification code is
   * ever stored to clear.
   */

  /**
   * Nothing to verify: no logged-in-but-unverified account, and no
   * pending registration either (not carried over, and not in router
   * state -- e.g. someone reached /verify directly with nothing behind
   * it). Send them to sign in rather than showing a dead form.
   *
   * A logged-in account that is ALREADY verified also has no job here --
   * checked ONCE, ON MOUNT, deliberately not reactively on every `user`
   * change.
   *
   * THAT DISTINCTION IS THE FIX FOR A RACE THAT REALLY HAPPENED: a
   * reactive `useEffect(() => { if (user.emailVerified) navigate(...) },
   * [user, ...])` re-runs the instant verifying succeeds in THIS session --
   * successful verification is exactly what flips user.emailVerified to
   * true. Guarding that effect with the local `done` flag looked right but
   * still lost the race: the Redux store update that sets user.emailVerified
   * happens inside the awaited dispatch in handleSubmit, and React 18 can
   * flush and re-render that alone, BEFORE handleSubmit resumes on the
   * next microtask to call setDone(true). For one render, `user` was
   * already verified while `done` was still false -- exactly the window
   * this effect needed to stay quiet, and didn't.
   *
   * A once-only mount check has no such window: it runs a single time,
   * before any verification in this session could possibly have happened,
   * so there is nothing for it to race against. A genuinely already-
   * verified arrival (the honest case this exists for) is still caught,
   * on that first run.
   */
  const hasCheckedOnMount = useRef(false);
  useEffect(() => {
    if (hasCheckedOnMount.current) return;
    hasCheckedOnMount.current = true;

    if (isAccountMode) {
      if (user.emailVerified) navigate(homeRouteFor(user), { replace: true });
      return;
    }
    if (!pendingRegistrationEmail) {
      navigate("/login", { replace: true });
    }
    // Deliberately NOT reactive (see above) -- intentionally omits
    // isAccountMode/user/pendingRegistrationEmail from the dependency
    // array beyond this mount-time read.
  }, [navigate]);

  const startCountdown = useCallback((seconds) => {
    setSecondsLeft(seconds > 0 ? seconds : 0);
  }, []);

  /**
   * Ask for a code on arrival -- unless we already know one is on its way.
   *
   * Registering already sends the first code and the register action feeds
   * its masked-address response into this same slice (see authActions.js),
   * so `sentTo` is normally already set by the time this screen mounts.
   * Sending again here would always land inside the cooldown that first
   * send just started, coming back as an immediate 429 that replaces the
   * real masked address with the generic fallback text below -- correct
   * behaviour, but a worse first impression for no reason. Only ask when
   * we do NOT already know where a code went: arriving here directly
   * (a reload, a bookmark, a barber whose earlier code expired) with
   * nothing in the verification slice yet.
   */
  useEffect(() => {
    if (askedOnce.current) return;
    if (isAccountMode && user.emailVerified) return;
    if (!isAccountMode && !pendingRegistrationEmail) return;
    askedOnce.current = true;

    if (sentTo) {
      // Already known from registration -- just start the same cooldown
      // clock the server told us about then, rather than asking again.
      startCountdown(resendAfterSeconds || 60);
      return;
    }

    const request = isAccountMode
      ? dispatch(sendVerificationCode())
      : dispatch(resendRegistrationCode(pendingRegistrationEmail));

    request.then((data) => {
      if (data) startCountdown(data.resendAfterSeconds || 60);
    });
  }, [
    isAccountMode,
    user,
    pendingRegistrationEmail,
    dispatch,
    startCountdown,
    sentTo,
    resendAfterSeconds,
  ]);

  // A 429 tells us exactly how long is left; reflect it.
  useEffect(() => {
    if (!error) return;
    const match = /(\d+)\s*seconds/.exec(error);
    if (match) startCountdown(Number(match[1]));
  }, [error, startCountdown]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (code.length !== 6) return;

    const ok = isAccountMode
      ? await dispatch(verifyAccount(code))
      : await dispatch(verifyRegistrationCode(pendingRegistrationEmail, code));

    if (ok) setDone(true);
  };

  const handleResend = async () => {
    setCode("");
    const data = isAccountMode
      ? await dispatch(sendVerificationCode())
      : await dispatch(resendRegistrationCode(pendingRegistrationEmail));
    if (data) startCountdown(data.resendAfterSeconds || 60);
  };

  if (!isAccountMode && !pendingRegistrationEmail) return null;

  /* ---------------------------- success ---------------------------- */
  if (done) {
    // In pending mode, verifyRegistrationCode's VERIFY_CODE_SUCCESS just
    // populated state.auth.user for the first time -- that IS the account
    // now. Falling back to the pre-verification `user` (account mode)
    // covers the other case.
    return (
      <AuthLayout variant="signin">
        <div className="bb-auth-success">
          <span className="bb-auth-success-mark" aria-hidden="true">
            <Check size={26} strokeWidth={2.5} />
          </span>

          <h1 className="bb-auth-title">Your account is ready.</h1>
          <p className="bb-auth-sub">
            Your email address is verified. You can start using VEYRON.
          </p>

          <button
            type="button"
            className="bb-auth-submit"
            onClick={() => navigate(homeRouteFor(user), { replace: true })}
          >
            Continue
          </button>
        </div>
      </AuthLayout>
    );
  }

  /* ---------------------------- the form --------------------------- */
  return (
    <AuthLayout variant="signin">
      <span className="bb-auth-badge" aria-hidden="true">
        <ShieldCheck size={22} strokeWidth={1.75} />
      </span>

      <h1 className="bb-auth-title">Verify your email</h1>
      <p className="bb-auth-sub">
        We sent a 6-digit verification code to{" "}
        <strong className="v-accent">{sentTo || "your email address"}</strong>.
        {expiresInMinutes
          ? ` It expires in ${expiresInMinutes} minutes.`
          : ""}
      </p>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <VerificationCodeInput
          value={code}
          onChange={setCode}
          error={fieldErrors.code}
          disabled={isVerifying}
        />

        <button
          type="submit"
          className="bb-auth-submit"
          disabled={isVerifying || code.length !== 6}
        >
          {isVerifying ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Checking...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <div className="bb-auth-resend">
        {secondsLeft > 0 ? (
          // aria-live so the countdown reaching zero is announced, rather
          // than a screen-reader user having to poll the button.
          <p className="v-dim" aria-live="polite">
            Resend code in {secondsLeft}s
          </p>
        ) : (
          <button
            type="button"
            className="bb-auth-link"
            onClick={handleResend}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyPage;
