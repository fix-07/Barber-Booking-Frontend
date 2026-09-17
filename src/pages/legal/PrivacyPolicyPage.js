import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

import { appFacts } from "../../config/business";
import Placeholder from "../../components/Placeholder";
import useBusinessSettings from "../../hooks/useBusinessSettings";

/**
 * Privacy Policy.
 *
 * HOW THIS WAS WRITTEN, so you can judge how much to trust it:
 *
 * Every statement about what the site collects was taken from the actual
 * database models and forms in this project, not from a template. If the code
 * does not do something, this page does not claim it does.
 *
 * What this page is NOT: legal advice, or a guarantee that you comply with any
 * particular law. I am not a lawyer. Which rules apply to you depends on where
 * your business is, where your customers are, and what you add to the site
 * later. Have a qualified local lawyer review it.
 *
 * IF YOU CHANGE THE APP, CHANGE THIS PAGE. Adding analytics, a payment
 * provider, an email service or an embedded map all change what this page must
 * say. Start with client/src/config/business.js, which holds the facts this
 * page quotes.
 */
const PrivacyPolicyPage = () => {
  const business = useBusinessSettings();

  return (
  <Container className="py-5">
    <div className="bb-prose">
      <h1>Privacy Policy</h1>

      <p className="text-muted">
        Last reviewed: <Placeholder value={business.policyUpdated} />
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Note for the site owner.</strong> This policy was written from
          what the code actually does. It is a starting point in plain language,
          not legal advice, and it is not a guarantee of compliance with any
          law. Please have a qualified local lawyer review it, and fill in every
          highlighted placeholder before you launch.
        </p>
        <p>
          Delete this box once a lawyer has reviewed the page.
        </p>
      </div>

      <p>
        This policy explains what information{" "}
        <Placeholder value={business.name} /> collects when you use this booking
        website, why we collect it, and what choices you have.
      </p>

      <h2>Who is responsible for your information</h2>

      <p>
        The business responsible for the information described here is:
      </p>

      <ul>
        <li>
          Trading name: <Placeholder value={business.name} />
        </li>
        <li>
          Registered legal name: <Placeholder value={business.legalName} />
        </li>
        <li>
          Registration number: <Placeholder value={business.registration} />
        </li>
        <li>
          Address: <Placeholder value={business.address} />
        </li>
        <li>
          Email: <Placeholder value={business.email} />
        </li>
      </ul>

      <h2>What we collect, and why</h2>

      <p>
        We only ask for what the site genuinely needs. There is no date of
        birth, no gender, no home address for customers, and no tracking of what
        you browse.
      </p>

      <h3>Your account</h3>

      <p>When you create an account we store:</p>

      <ul>
        {appFacts.personalDataStored.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>
        Your <strong>name</strong> and <strong>email address</strong> are
        required. The email address is how you log in and the only way we can
        contact you about a booking.
      </p>

      <p>
        Your <strong>phone number is required</strong>. It exists for one
        purpose: so a barber can contact you if there is a problem with your
        appointment on the day, such as a delay or a cancellation, when email
        may not reach you in time. The barber you book with can see it for
        that booking. It is never published and never shown to any other
        customer.
      </p>

      <h3>If you are a barber</h3>

      <p>
        A barber account also stores the shop information you choose to publish:
      </p>

      <ul>
        {appFacts.barberDataStored.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>
        This information is <strong>public</strong> once you publish your
        profile, because its purpose is to help customers find you. You control
        whether your profile is published at all, and the street address and
        contact phone are both optional. The phone number on your{" "}
        <em>account</em> is separate and is never published.
      </p>

      <h3>Your bookings</h3>

      <p>
        When you book, we store the date and time, which service you chose, the
        price agreed at that moment, the status of the appointment, and any note
        you add. If a booking is cancelled we also record when, by which side,
        and the reason if one was given.
      </p>

      <p>
        We keep the price as it was when you booked, rather than looking it up
        later. That way, if a barber changes their prices, your booking history
        still shows what you actually agreed to.
      </p>

      <h3>What the other party can see</h3>

      <ul>
        <li>
          A <strong>barber</strong> can see your name, your phone number if you
          gave one, and the details of bookings <em>with them</em>. They cannot
          see your email address, and they cannot see your bookings with anyone
          else.
        </li>
        <li>
          A <strong>customer</strong> can see the barber's display name and the
          shop details the barber chose to publish. They cannot see the barber's
          account email or private phone number.
        </li>
        <li>
          Nobody can see anyone else's bookings. Our system only ever sends you
          your own.
        </li>
      </ul>

      <h3>What visitors can see without an account</h3>

      <p>
        Anyone can browse published barber profiles, their services and prices,
        and which appointment times are free or taken. A free or taken time slot
        shows no customer information at all: not a name, not a service, nothing
        about who booked it.
      </p>

      <h2>How your password is protected</h2>

      <p>
        We never store your password. When you create it, it is put through a
        one-way process called <strong>bcrypt hashing</strong>, and only the
        result of that process is saved.
      </p>

      <p>
        In practice this means that even someone with full access to our
        database cannot read your password, and neither can we. When you log in,
        we hash what you typed and compare the two results. We also never
        include the stored hash in anything the website sends back to your
        browser.
      </p>

      <p>
        Please still use a password you do not use on other sites. If any other
        site you use is breached, a shared password puts this account at risk
        too, and that is not something we can protect you from.
      </p>

      <h2>Cookies</h2>

      <p>
        This site uses <strong>one</strong> cookie. It holds your login session
        so you stay logged in between pages, and it is set only when you log in.
        It cannot be read by any JavaScript in your browser, which protects it
        from being stolen by a malicious script.
      </p>

      <p>
        We do not use cookies for analytics, advertising, or tracking you across
        websites. There are none to switch off. The{" "}
        <Link to="/cookie-policy">Cookie Policy</Link> explains this in more
        detail.
      </p>

      <h2>Analytics and tracking</h2>

      <p>
        {appFacts.hasAnalytics
          ? "This site uses analytics. See the Cookie Policy for details."
          : "This site has no analytics and no tracking. There is no Google Analytics, no Meta Pixel, no advertising script, and no third-party tracker of any kind."}
      </p>

      <p>
        The site also loads no fonts, maps, videos or widgets from other
        companies. Everything your browser downloads comes from this site, which
        means no other company receives your IP address or sees which pages you
        visit.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> If you add analytics, a font service, a
          map, an embedded video, or a social widget, this section becomes
          untrue. You would need to update it, update the Cookie Policy, and
          consider whether you must ask for consent before loading it. In many
          places, including the UK and EU, non-essential tracking generally
          requires consent first.
        </p>
      </div>

      <h2>Who else can see your information</h2>

      <p>
        We do not sell your information, and we do not share it for advertising.
      </p>

      <p>
        We do rely on technical service providers to run the site. They store or
        process information on our behalf, under our instructions:
      </p>

      <ul>
        <li>
          Website and application hosting:{" "}
          <span className="bb-needs-filling">
            [HOSTING PROVIDER NAME AND COUNTRY]
          </span>
        </li>
        <li>
          Database hosting:{" "}
          <span className="bb-needs-filling">
            [DATABASE PROVIDER NAME AND COUNTRY]
          </span>
        </li>
        {appFacts.thirdPartyEmbeds.some((e) => e.domain === "accounts.google.com") && (
          <li>
            Sign-in, if you choose "Sign in with Google": Google LLC. Choosing
            that option shares your name and email address with us, as
            confirmed by your Google account -- we do not receive your Google
            password or anything else from your Google account.
          </li>
        )}
      </ul>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> Name your real providers above, and the
          country their servers are in. If data leaves your own country, some
          laws require you to say so and to have a legal mechanism for that
          transfer. This project is currently configured to connect to a hosted
          MongoDB cluster, so a database provider almost certainly belongs in
          that list, but only you can confirm which services you actually use.
        </p>
        <p>
          Also tell your lawyer about your actual email-sending provider (for
          verification codes and booking confirmations) -- Gmail SMTP and/or
          Resend, depending on how server/.env is configured. That provider
          sees customer email addresses and belongs in this list too.
        </p>
      </div>

      <p>
        We may also disclose information where we are legally required to, for
        example in response to a valid legal request.
      </p>

      <h2>Payments</h2>

      <p>
        {appFacts.takesOnlinePayments
          ? "Payments are processed on this site. See the Refund Policy for details."
          : "This site does not take payments. We do not ask for and do not store card numbers or bank details anywhere. A booking records the price agreed so both sides know the amount, and payment is arranged directly with the barber."}
      </p>

      <h2>How long we keep your information</h2>

      <p>
        We keep your account and your booking history for as long as your
        account is open, so that you and your barber can both see what was
        arranged.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - this needs a decision from you.</strong> You
          should set a definite retention period, for example "booking records
          are deleted X years after the appointment", and say what happens when
          someone asks to close their account. Tax or accounting rules in your
          country may require you to keep certain records for a set number of
          years, which can override a customer's deletion request. Your lawyer
          or accountant can tell you the right period. Replace this box with
          your actual answer.
        </p>
      </div>

      <h2>Your choices and your rights</h2>

      <p>Whatever your location, you can:</p>

      <ul>
        <li>Choose not to add a note when booking.</li>
        <li>Cancel an upcoming booking yourself.</li>
        <li>
          If you are a barber, unpublish your shop profile so it no longer
          appears publicly.
        </li>
        <li>
          Contact us at <Placeholder value={business.email} /> to ask about,
          correct, or request deletion of your information.
        </li>
      </ul>

      <p>
        Depending on where you live, you may also have formal legal rights over
        your information, such as the right to get a copy of it, to have it
        corrected, to have it deleted, to object to certain uses, or to complain
        to a data protection regulator.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> Which rights apply, the exact wording
          required, the deadline for responding, and which regulator people can
          complain to all depend on your jurisdiction and your customers'
          locations. For example, the UK and EU GDPR grant a specific set of
          rights with a one-month response deadline and require you to name the
          supervisory authority. Other places differ, and some have no such
          regime at all. I have deliberately not listed specific rights or named
          a regulator, because doing so without knowing your jurisdiction would
          mean inventing legal requirements. Your lawyer should complete this
          section.
        </p>
      </div>

      <h2>Children</h2>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - this needs a decision from you.</strong> Decide
          whether under-18s may hold an account, and whether a parent books on
          a child's behalf instead. Many places set a minimum age for
          consenting to online services, and it is not the same everywhere.
          Barbers commonly serve children, so this is a real question for this
          kind of business rather than a formality. State your actual rule here
          once you have decided, and have it checked.
        </p>
      </div>

      <h2>Keeping your information secure</h2>

      <p>We take a number of measures to protect your information:</p>

      <ul>
        <li>Passwords are stored only as bcrypt hashes, never as text.</li>
        <li>
          Login sessions use a cookie that JavaScript cannot read, which
          protects it from theft by a malicious script.
        </li>
        <li>
          Every request that touches private information is checked on our
          server, not only in your browser, and is limited to the account that
          owns that information.
        </li>
        <li>
          Repeated failed logins from the same network are rate limited to slow
          down password guessing.
        </li>
        <li>
          Information you submit is validated before it reaches the database.
        </li>
      </ul>

      <p>
        No website can promise that information is completely safe, and we are
        not going to pretend otherwise. If we ever become aware of a breach
        affecting your information, we will act on it and follow whatever
        notification duties apply to us.
      </p>

      <h2>Changes to this policy</h2>

      <p>
        If we change how we handle information, we will update this page and
        change the "last reviewed" date at the top. If a change is significant,
        such as introducing analytics or payments, we will make that clear
        rather than quietly editing the text.
      </p>

      <h2>How to contact us</h2>

      <p>
        For any question about your information, or to exercise a right
        described above, contact:
      </p>

      <ul>
        <li>
          Email: <Placeholder value={business.email} />
        </li>
        <li>
          Phone: <Placeholder value={business.phone} />
        </li>
        <li>
          Post: <Placeholder value={business.address} />
        </li>
      </ul>

      <p>
        See also our <Link to="/terms">Terms and Conditions</Link>,{" "}
        <Link to="/cookie-policy">Cookie Policy</Link> and{" "}
        <Link to="/refund-policy">Refund Policy</Link>.
      </p>
    </div>
  </Container>
  );
};

export default PrivacyPolicyPage;
