import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

import { appFacts } from "../../config/business";
import Placeholder from "../../components/Placeholder";
import useBusinessSettings from "../../hooks/useBusinessSettings";

/**
 * Refund Policy.
 *
 * THE CENTRAL FACT: this site takes no payment. Nothing in the code collects
 * card details or charges anyone. So a policy full of refund timescales and
 * processing fees would be describing a system that does not exist.
 *
 * Rather than invent one, this page says plainly what the situation is today,
 * separates each scenario you asked about, and marks clearly which decisions
 * are still yours to make. If you add online payments, the page tells you what
 * needs rewriting.
 */
const RefundPolicyPage = () => {
  const business = useBusinessSettings();

  return (
  <Container className="py-5">
    <div className="bb-prose">
      <h1>Refund Policy</h1>

      <p className="text-muted">
        Last reviewed: <Placeholder value={business.policyUpdated} />
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Note for the site owner.</strong> This page describes the true
          position today: the site takes no payments, so there is nothing for it
          to refund. I have not invented refund rules, timescales or fees. The
          sections marked below need a decision from you, and consumer-protection
          rules in your area may limit what you are allowed to decide. Have a
          qualified local lawyer review it.
        </p>
        <p>Delete this box once a lawyer has reviewed the page.</p>
      </div>

      {!appFacts.takesOnlinePayments && (
        <>
          <h2>Important: this website does not take payment</h2>

          <p>
            Read this first, because it shapes everything below.{" "}
            <strong>
              No payment is taken through this site at any point.
            </strong>{" "}
            We do not ask for card numbers or bank details, there is no checkout,
            and no money passes through us.
          </p>

          <p>
            When you book, the price of the service is recorded so that you and
            the barber both know what was agreed. You pay the barber directly, by
            whatever means they accept, at the appointment.
          </p>

          <p>
            Because we never take your money, <strong>we have no money to
            refund</strong>. Any question about a payment, a deposit, or money
            owed is between you and the barber.
          </p>

          <p>
            Cancelling a booking on this site simply releases the appointment
            time. It does not trigger a payment or a refund, because there was
            never a payment.
          </p>
        </>
      )}

      <h2>Cancelling a booking</h2>

      <p>
        Either side can cancel an appointment that has not yet happened, through
        the site:
      </p>

      <ul>
        <li>
          A customer cancels from{" "}
          <Link to="/my-bookings">My bookings</Link>.
        </li>
        <li>A barber cancels or declines from their appointments list.</li>
      </ul>

      <p>
        Cancelling frees the time so another customer can book it. We record who
        cancelled and when. An appointment already marked completed or no-show
        cannot be cancelled.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - decide your notice period.</strong> The site
          currently places no time limit on cancelling. You may want one, for
          example "at least 24 hours before the appointment". Decide it, state it
          here, and keep it the same as the{" "}
          <Link to="/terms">Terms and Conditions</Link>.
        </p>
      </div>

      <h2>Each situation, separately</h2>

      <h3>If the customer cancels</h3>

      <p>
        The appointment is marked "Cancelled by customer" and the time is
        released.
      </p>

      <p>
        {appFacts.takesOnlinePayments ? (
          <>See your payment terms for what happens to any payment taken.</>
        ) : (
          <>
            As no payment was taken through this site, there is nothing to
            refund. If you have paid the barber anything directly, such as a
            deposit, ask the barber about it.
          </>
        )}
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - decide.</strong> Is there any charge for a late
          cancellation? Be careful here: consumer-protection rules in many places
          limit or forbid penalty charges, and an unfair term can be
          unenforceable. Get this checked before you publish a figure.
        </p>
      </div>

      <h3>If the barber cancels</h3>

      <p>
        The appointment is marked "Cancelled by barber". The barber can add a
        reason, which you will see on your booking. You are free to book another
        time, with them or with a different barber.
      </p>

      <p>
        {appFacts.takesOnlinePayments ? (
          <>See your payment terms for what happens to any payment taken.</>
        ) : (
          <>
            As no payment was taken through this site, there is nothing for us to
            refund. If you paid the barber directly for an appointment they then
            cancelled, you should expect that money back from the barber. Ask
            them first, and contact us at <Placeholder value={business.email} />{" "}
            if you cannot resolve it.
          </>
        )}
      </p>

      <h3>If you do not attend (no-show)</h3>

      <p>
        A barber can mark an appointment as a no-show if you did not attend and
        did not cancel. This is recorded on the booking.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - decide.</strong> Is there a no-show charge? Does
          repeated no-showing affect the account? The code records the no-show
          but applies no charge and no automatic consequence. State your actual
          rule here, and have any charge reviewed, for the same reason as above.
        </p>
      </div>

      <h3>If a payment was taken but the appointment was cancelled</h3>

      <p>
        {appFacts.takesOnlinePayments ? (
          <>
            Describe here how and when the payment is returned, and by what
            method.
          </>
        ) : (
          <>
            This cannot happen through this website, because the website takes no
            payment. If you paid the barber directly and the appointment did not
            go ahead, that is a matter between you and the barber. We will help
            where we reasonably can.
          </>
        )}
      </p>

      <h3>If the service was not provided</h3>

      <p>
        If you attended and the barber did not provide the service, tell the
        barber first. They are the one providing the service and the one who can
        put it right.
      </p>

      <p>
        You can also contact us at <Placeholder value={business.email} /> with
        what happened. We provide the booking website rather than the haircut, so
        there are limits to what we can do, but we will look into it.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - this is the one to get legal advice on.</strong>{" "}
          Where a service is not provided or is done badly, consumer-protection
          law in many places gives the customer rights against the trader that a
          policy page cannot remove, often including repeat performance or a
          price reduction. Those rights usually sit against whoever provided the
          service. Whether they can also reach you depends on whether you are an
          intermediary or the provider, which is the same question raised in
          section 2 of the Terms. Ask your lawyer both questions together.
        </p>
      </div>

      <h3>If you are unhappy with the result</h3>

      <p>
        Speak to the barber. Hairdressing is a matter of taste and most problems
        are best sorted out directly, often by the barber adjusting the cut.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - decide.</strong> Do barbers on your site have to
          offer a fix, a partial refund, or nothing? If you are a platform, do
          you require it of them in your barber terms? This is a business policy
          decision and I have not made it for you.
        </p>
      </div>

      <h2>How a refund would be processed</h2>

      <p>
        {appFacts.takesOnlinePayments ? (
          <>
            Set out here the method, the timescale, and who the customer should
            contact.
          </>
        ) : (
          <>
            There is no refund process on this website, because there is no
            payment process. Nothing to refund means nothing to process. If that
            ever changes, this page will be updated before payments are switched
            on.
          </>
        )}
      </p>

      <h2>Still to be decided</h2>

      <p>
        In the interests of being straight with you, these points are genuinely
        not settled yet and are not hidden in the text above:
      </p>

      <ul>
        <li>Whether a minimum cancellation notice period applies.</li>
        <li>Whether any charge applies to a late cancellation or a no-show.</li>
        <li>
          Whether online payments will be introduced, and what the refund terms
          would then be.
        </li>
        <li>
          What happens when a barber repeatedly cancels at short notice.
        </li>
      </ul>

      <h2>Your legal rights</h2>

      <p>
        Nothing on this page takes away rights you have under the consumer law
        that applies to you. Those rights depend on where you are and who
        provided the service.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note.</strong> I have deliberately not listed specific
          statutory rights or named any law, because doing that without knowing
          your jurisdiction would mean inventing legal requirements. Once you set
          the jurisdiction in{" "}
          <code>client/src/config/business.js</code>, have a lawyer complete
          this section with the real position, including any mandatory wording
          your local rules require.
        </p>
      </div>

      <h2>How to contact us</h2>

      <ul>
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
        <Link to="/terms">Terms and Conditions</Link> and{" "}
        <Link to="/cookie-policy">Cookie Policy</Link>.
      </p>
    </div>
  </Container>
  );
};

export default RefundPolicyPage;
