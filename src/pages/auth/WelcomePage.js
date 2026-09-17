import React from "react";
import { Link } from "react-router-dom";
import { LogIn, CalendarCheck, Scissors, ChevronRight } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";

/**
 * The entry screen: three separate doors rather than one form with a role
 * picker inside it.
 *
 * ==========================================================================
 *  WHY THERE IS NO "ACCOUNT TYPE" DROPDOWN
 * ==========================================================================
 *
 * The brief rules one out, and it is right to. Choosing between customer
 * and barber is not a property of a form -- it decides which form you
 * should be looking at. A customer signing up needs five fields; a barber
 * needs a profile, contact details, specialities, a location and their
 * services, and then waits for admin approval. Those are different
 * journeys with different endings, and a <select> at the top of a shared
 * form hides that until you have already committed to filling it in.
 *
 * Separate routes also mean each path can be linked to directly, which is
 * what the homepage's "Join as a barber" button has always wanted to do.
 *
 * This replaces the radio-button fieldset that used to sit at the top of
 * RegisterPage.js. That version was accessible and correctly built -- it
 * was the right answer to the wrong question.
 */

const CHOICES = [
  {
    to: "/login",
    icon: LogIn,
    title: "Sign in",
    text: "You already have an account.",
  },
  {
    to: "/signup/customer",
    icon: CalendarCheck,
    title: "Create customer account",
    text: "For people looking to discover and book barbers.",
  },
  {
    to: "/signup/barber",
    icon: Scissors,
    title: "Join as a barber",
    text: "For professionals who want a profile and to accept customers.",
    pro: true,
  },
];

const WelcomePage = () => (
  <AuthLayout variant="signin">
    <h1 className="bb-auth-title">Welcome to VEYRON</h1>
    <p className="bb-auth-sub">
      Choose how you want to use the platform. You can always sign in later
      with the account you create.
    </p>

    <div className="bb-auth-choices">
      {CHOICES.map(({ to, icon: Icon, title, text, pro }) => (
        <Link
          key={to}
          to={to}
          className={"bb-choice" + (pro ? " bb-choice-pro" : "")}
        >
          <span className="bb-choice-icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.75} />
          </span>

          <span className="bb-choice-body">
            <span className="bb-choice-title">{title}</span>
            <span className="bb-choice-text">{text}</span>
          </span>

          <ChevronRight
            size={18}
            strokeWidth={2}
            className="bb-choice-arrow"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  </AuthLayout>
);

export default WelcomePage;
