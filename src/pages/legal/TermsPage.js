import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

import { appFacts } from "../../config/business";
import Placeholder from "../../components/Placeholder";
import useBusinessSettings from "../../hooks/useBusinessSettings";

/**
 * Terms and Conditions.
 *
 * Written from how the application actually behaves. Where a rule is a
 * BUSINESS DECISION rather than something the code decides, I have said so
 * plainly instead of inventing a rule. Cancellation notice periods, no-show
 * charges and age limits are all in that category: they are yours to set.
 *
 * The governing law is left as a placeholder on purpose. Guessing it would be
 * inventing the single most consequential line on the page.
 */
const TermsPage = () => {
  const business = useBusinessSettings();

  return (
  <Container className="py-5">
    <div className="bb-prose">
      <h1>Terms and Conditions</h1>

      <p className="text-muted">
        Last reviewed: <Placeholder value={business.policyUpdated} />
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Note for the site owner.</strong> These terms describe how the
          site actually works today. They are a plain-language starting point,
          not legal advice, and they are not a guarantee of compliance with any
          law. Several clauses below need a decision from you, and the governing
          law and liability sections in particular should be reviewed by a
          qualified local lawyer before you rely on them.
        </p>
        <p>Delete this box once a lawyer has reviewed the page.</p>
      </div>

      <h2>1. Who these terms are between</h2>

      <p>
        These terms are an agreement between you and{" "}
        <Placeholder value={business.legalName} />, trading as{" "}
        <Placeholder value={business.name} />, for your use of this website.
      </p>

      <p>
        By creating an account or making a booking, you accept these terms. If
        you do not accept them, please do not use the site.
      </p>

      <h2>2. What this website does</h2>

      <p>
        This site lets customers find barbers, see the services and prices a
        barber has published, and request an appointment. It lets barbers
        publish their shop details, list their services, and manage their
        appointments.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - an important decision.</strong> It matters
          legally whether you are (a) a barber shop taking your own bookings, or
          (b) a platform connecting independent barbers with customers. In case
          (b) you are an intermediary, the haircut contract is between the
          customer and the barber, and you may have extra duties as a platform.
          The wording below is written for (b), the platform case, because the
          code supports many independent barbers. If you are actually case (a),
          this section and the liability section need rewriting. Tell your
          lawyer which you are.
        </p>
      </div>

      <h2>3. Your account</h2>

      <ul>
        <li>
          You must give accurate information when you create an account, and
          keep it up to date.
        </li>
        <li>
          You are responsible for keeping your password private, and for
          anything done through your account.
        </li>
        <li>
          Please use a password you do not use on other websites, and tell us at{" "}
          <Placeholder value={business.email} /> if you think someone else has
          access to your account.
        </li>
        <li>
          One person, one account. Do not create an account for someone else
          without their knowledge.
        </li>
      </ul>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - decide the minimum age.</strong> Decide whether
          someone under 18 can hold an account, or whether a parent or guardian
          must book for them. Barbers regularly serve children, so this is a real
          question here. Many places also set a minimum age for agreeing to
          online services, and it differs by country. State your rule here once
          you have decided it.
        </p>
      </div>

      <h2>4. If you are a customer</h2>

      <ul>
        <li>
          Book only appointments you intend to keep. A held slot is a slot
          another customer cannot take.
        </li>
        <li>
          Arrive on time. A barber works to a schedule, and arriving late may
          mean your appointment cannot be completed.
        </li>
        <li>
          If you cannot attend, cancel through the site as early as you can so
          the time can be released.
        </li>
        <li>
          Pay the barber for the service you receive, at the price shown when
          you booked.
        </li>
        <li>
          Tell the barber directly about anything relevant to your haircut, for
          example a skin condition or an allergy to a product. Please do not put
          health information in the booking note field.
        </li>
      </ul>

      <h2>5. If you are a barber</h2>

      <ul>
        <li>
          Keep your published information accurate: your services, your prices,
          your opening hours and your shop details.
        </li>
        <li>
          Do not publish claims you cannot support. That includes invented
          reviews, ratings, awards, or customer numbers. Making up reviews or
          endorsements is unlawful in many places, not merely frowned upon.
        </li>
        <li>
          Respond to booking requests promptly, and honour the appointments you
          confirm.
        </li>
        <li>
          If you must cancel, do it through the site as early as possible and
          give the customer a reason.
        </li>
        <li>
          Only publish a contact phone number you are happy to make public.
        </li>
        <li>
          You are responsible for your own business: your licences, insurance,
          hygiene standards, tax, and the service you actually provide.
        </li>
      </ul>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> If you operate as a platform for
          independent barbers, your lawyer may want to add terms about
          qualifications, insurance, and what happens if a barber repeatedly
          cancels or fails to appear. Local rules on barbering licences and
          hygiene vary a great deal and I have not assumed any.
        </p>
      </div>

      <h2>6. How booking works</h2>

      <p>Bookings follow these rules, which the site enforces:</p>

      <ul>
        <li>
          You choose a service, a date and a time. Only times inside the
          barber's opening hours are offered, and the appointment must finish
          before the shop closes.
        </li>
        <li>
          A time already taken cannot be booked. Two people cannot hold the same
          appointment.
        </li>
        <li>You cannot book a time in the past.</li>
        <li>
          Bookings can be made up to 180 days ahead.
        </li>
        <li>
          You cannot hold two appointments that overlap each other.
        </li>
        <li>
          Times are shown in the barber's local timezone, which is stated on
          their page.
        </li>
      </ul>

      <h2>7. When a booking is actually agreed</h2>

      <p>
        {appFacts.bookingsNeedBarberConfirmation ? (
          <>
            This matters, so please read it. When you book, your appointment is
            a <strong>request</strong>. It shows as "Awaiting confirmation" and
            is only agreed once the barber <strong>confirms</strong> it. Until
            then the barber may decline it.
          </>
        ) : (
          <>A booking is confirmed as soon as you make it.</>
        )}
      </p>

      <p>
        You can see the current status of any booking at any time under{" "}
        <Link to="/my-bookings">My bookings</Link>.
      </p>

      <h2>8. Appointment statuses</h2>

      <dl>
        <dt>Awaiting confirmation</dt>
        <dd>Requested by the customer, not yet accepted by the barber.</dd>

        <dt>Confirmed</dt>
        <dd>The barber has accepted. The appointment is agreed.</dd>

        <dt>Completed</dt>
        <dd>The appointment took place.</dd>

        <dt>Cancelled by customer</dt>
        <dd>The customer cancelled it.</dd>

        <dt>Cancelled by barber</dt>
        <dd>The barber cancelled it.</dd>

        <dt>No-show</dt>
        <dd>
          The barber recorded that the customer did not attend and did not
          cancel.
        </dd>
      </dl>

      <p>
        We record who cancelled, and when, because that can affect what happens
        next.
      </p>

      <h2>9. Cancellations</h2>

      <p>What the site allows today:</p>

      <ul>
        <li>
          A customer can cancel an appointment that has not yet happened.
        </li>
        <li>
          A barber can cancel or decline an appointment that has not yet
          happened.
        </li>
        <li>
          Cancelling releases the time so someone else can book it.
        </li>
        <li>
          An appointment already marked completed or no-show cannot be
          cancelled.
        </li>
      </ul>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - these need decisions from you.</strong> The code
          places no time limit on cancelling and applies no charge. Those are
          business rules, not technical ones, and I have not invented them.
          Decide:
        </p>
        <ul>
          <li>
            How much notice should a customer give? For example "at least 24
            hours before the appointment".
          </li>
          <li>Is there any charge for a late cancellation or a no-show?</li>
          <li>
            What happens if a barber repeatedly cancels at short notice?
          </li>
        </ul>
        <p>
          Be aware that consumer-protection rules in many places limit what you
          can charge for a cancellation, and can restrict penalty fees
          altogether. Get your cancellation rules checked before you publish
          them, then replace this box with your actual policy and mirror it in
          the <Link to="/refund-policy">Refund Policy</Link>.
        </p>
      </div>

      <h2>10. Prices and payment</h2>

      <p>
        Each service shows its price and length before you book, and we record
        the price as it was at the moment you booked. If a barber changes their
        prices afterwards, your existing booking keeps the price you agreed.
      </p>

      <p>
        {appFacts.takesOnlinePayments ? (
          <>Payment is taken through this website.</>
        ) : (
          <>
            <strong>This website does not take payment.</strong> No card or bank
            details are collected anywhere on the site. You pay the barber
            directly, by whatever means they accept. Any question about payment
            is between you and the barber.
          </>
        )}
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> If you add online payments later, this
          section, the <Link to="/refund-policy">Refund Policy</Link> and the{" "}
          <Link to="/privacy-policy">Privacy Policy</Link> all need updating, and
          a number of additional rules are likely to apply to you, including
          distance-selling and consumer cancellation rights in many
          jurisdictions. Treat that as a separate piece of legal work, not a
          small change.
        </p>
      </div>

      <h2>11. Things you must not do</h2>

      <ul>
        <li>
          Make bookings you do not intend to keep, or book in bulk to block a
          barber's calendar.
        </li>
        <li>Use someone else's account, or pretend to be someone else.</li>
        <li>
          Try to get at information that is not yours, including other people's
          bookings or account details.
        </li>
        <li>
          Try to break, overload, probe or work around the security of the site.
        </li>
        <li>
          Use automated tools to scrape the site or to create accounts or
          bookings.
        </li>
        <li>
          Post false, abusive, threatening, discriminatory or unlawful content,
          including in a booking note or a shop description.
        </li>
        <li>Publish invented reviews, ratings or endorsements.</li>
        <li>Use the site for anything unlawful.</li>
      </ul>

      <h2>12. Suspending or closing an account</h2>

      <p>
        We may suspend or close an account that breaks these terms, or where we
        reasonably believe it is being used fraudulently or to harm someone
        else. Where it is reasonable to do so, we will tell you why.
      </p>

      <p>
        You may stop using the site at any time. To have your account closed,
        contact us at <Placeholder value={business.email} />. See the{" "}
        <Link to="/privacy-policy">Privacy Policy</Link> for what happens to
        your information.
      </p>

      <h2>13. Intellectual property</h2>

      <p>
        The design, text, layout and code of this website belong to{" "}
        <Placeholder value={business.legalName} />, except for third-party
        open-source software used under its own licence.
      </p>

      <p>
        Content a barber publishes about their own shop remains theirs. By
        publishing it here, a barber gives us permission to display it on the
        site for the purpose of taking bookings.
      </p>

      <p>
        Do not copy, republish or resell the content or the design of this site
        without permission.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note on images.</strong> The site currently contains no
          photographs at all. The only graphic is a simple icon made for this
          project. That is deliberate: stock or AI-generated "barber shop"
          photos would misrepresent real businesses, and images taken from a web
          search would infringe someone's copyright. If you add photos, use
          pictures you own, or ones each barber uploads of their own shop, and
          keep a record of where each one came from.
        </p>
      </div>

      <h2>14. Other services we rely on</h2>

      <p>
        We use third-party providers to host this website and its database. They
        are listed in the <Link to="/privacy-policy">Privacy Policy</Link>. We
        choose them carefully, but we do not control their networks and cannot be
        responsible for their failures.
      </p>

      <h2>15. Availability and changes to the service</h2>

      <p>
        We aim to keep the site available, but we do not promise it will be
        available without interruption. We may need to take it offline for
        maintenance, and we may add, change or remove features.
      </p>

      <p>
        If we make a significant change to these terms, we will update this page
        and change the date at the top. Continuing to use the site after a change
        means you accept the updated terms.
      </p>

      <h2>16. Our responsibility to you</h2>

      <p>
        We provide the booking website. We do not cut hair. The haircut or other
        service is provided by the barber, and the barber is responsible for it,
        including its quality, safety, and whether they turn up.
      </p>

      <p>
        We are not responsible for a barber cancelling, being late, closing down,
        or providing a service you are unhappy with. Raise those with the barber
        first. You can also contact us at{" "}
        <Placeholder value={business.email} /> and we will help where we
        reasonably can.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - do not write this section yourself.</strong> A
          limitation of liability clause is the part of any terms most likely to
          be unenforceable if it is drafted badly or copied from another site.
          Consumer-protection law in many places makes certain exclusions void,
          and you usually cannot exclude liability for death or personal injury
          caused by negligence, or for fraud. The paragraphs above state the
          practical position in plain language on purpose and are NOT a complete
          liability clause. Have a qualified lawyer draft the real one for{" "}
          <Placeholder value={business.jurisdiction} />.
        </p>
      </div>

      <h2>17. Complaints</h2>

      <p>
        If something goes wrong, contact us at{" "}
        <Placeholder value={business.email} /> or{" "}
        <Placeholder value={business.phone} /> and tell us what happened. We will
        look into it.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> Some jurisdictions require you to tell
          consumers about an alternative dispute resolution scheme or an official
          complaints body. Ask your lawyer whether that applies to you, and add
          it here if it does.
        </p>
      </div>

      <h2>18. Governing law</h2>

      <p>
        These terms are governed by the law of{" "}
        <Placeholder value={business.jurisdiction} />, and disputes will be dealt
        with by the courts of{" "}
        <Placeholder value={business.jurisdiction} />.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - this is the most important blank on the page.</strong>{" "}
          I have not guessed your governing law, because getting it wrong can
          make the whole clause useless. Set it in{" "}
          <code>client/src/config/business.js</code> and have a lawyer confirm
          it.
        </p>
        <p>
          Note also that in many places a consumer keeps the protection of their
          own country's law and the right to sue in their own local courts,
          whatever a clause like this says. So this clause may not do what it
          appears to do for customers outside your country. That is exactly the
          kind of thing worth asking about.
        </p>
      </div>

      <h2>19. How to contact us</h2>

      <ul>
        <li>
          Business: <Placeholder value={business.name} />
        </li>
        <li>
          Email: <Placeholder value={business.email} />
        </li>
        <li>
          Phone: <Placeholder value={business.phone} />
        </li>
        <li>
          Address: <Placeholder value={business.address} />
        </li>
      </ul>

      <p>
        See also our <Link to="/privacy-policy">Privacy Policy</Link>,{" "}
        <Link to="/cookie-policy">Cookie Policy</Link> and{" "}
        <Link to="/refund-policy">Refund Policy</Link>.
      </p>
    </div>
  </Container>
  );
};

export default TermsPage;
