import React from "react";
import { Link } from "react-router-dom";
import { Container, Table } from "react-bootstrap";

import { appFacts } from "../../config/business";
import Placeholder from "../../components/Placeholder";
import useBusinessSettings from "../../hooks/useBusinessSettings";

/**
 * Cookie Policy.
 *
 * ============================================================
 *  WHY THERE IS NO COOKIE BANNER ON THIS SITE
 * ============================================================
 * I checked what the application actually does before writing this page.
 *
 * The site sets exactly ONE cookie: the login session token. It is set only
 * when you log in, it is required for logging in to work at all, and it is not
 * used to track anyone or to advertise. There is no analytics, no pixel, no ad
 * script, and nothing loaded from another company's server, so there is no
 * third-party cookie either.
 *
 * Rules like the EU ePrivacy Directive and the UK PECR generally require
 * consent BEFORE setting cookies, but they carve out cookies that are strictly
 * necessary to provide a service the user has asked for. A login session cookie
 * is the textbook example of that exception.
 *
 * So a consent banner here would ask permission for the only cookie the user
 * cannot decline without breaking login. That is consent theatre: it trains
 * people to click through banners without reading them and gains them nothing.
 * Adding fake cookies so a banner looks justified would be worse still.
 *
 * THE HONEST CAVEAT: this is a reasoned position, not a legal certainty, and
 * the strictly-necessary exception is interpreted differently by different
 * regulators. Have a local lawyer confirm it for your jurisdiction.
 *
 * THE MOMENT THIS CHANGES: if you add analytics, advertising, a font service,
 * an embedded map or video, or a social widget, you will very likely need a
 * consent mechanism that blocks those until the visitor agrees. See the note at
 * the bottom of this page.
 */
const CookiePolicyPage = () => {
  const business = useBusinessSettings();

  return (
  <Container className="py-5">
    <div className="bb-prose">
      <h1>Cookie Policy</h1>

      <p className="text-muted">
        Last reviewed: <Placeholder value={business.policyUpdated} />
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Note for the site owner.</strong> This page was written after
          checking what the code actually sets. It is accurate for the site as it
          stands today. It is not legal advice and not a guarantee of compliance.
          Read the note at the bottom before adding anything to the site.
        </p>
        <p>Delete this box once a lawyer has reviewed the page.</p>
      </div>

      <h2>The short version</h2>

      <p>
        This site uses <strong>one cookie</strong>. It keeps you logged in. We do
        not use cookies to track you, to build a profile of you, or to advertise
        to you.
      </p>

      <p>
        That is why you will not see a cookie banner here. There is nothing
        optional to agree to or refuse.
      </p>

      <h2>What a cookie is</h2>

      <p>
        A cookie is a small piece of text a website asks your browser to store
        and send back on your next visit. It is how a site can remember
        something between pages, because otherwise every page request would look
        like a complete stranger arriving.
      </p>

      <h2>The cookie this site uses</h2>

      {/* `responsive` makes a wide table scroll inside its own box on a phone
          instead of making the whole page scroll sideways. Every <th> keeps its
          scope attribute so a screen reader announces each cell with its
          column heading. */}
      <Table responsive bordered className="mb-4">
        <caption className="text-muted small">
          Every cookie set by this website
        </caption>
        <thead className="table-light">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Purpose</th>
            <th scope="col">Type</th>
            <th scope="col">How long it lasts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>token</code>
            </td>
            <td>
              Keeps you logged in. Without it you would be logged out on every
              page you open.
            </td>
            <td>
              Strictly necessary
              <br />
              <span className="text-muted small">
                Set by this site, not a third party
              </span>
            </td>
            <td>7 days, or until you log out</td>
          </tr>
        </tbody>
      </Table>

      <p>Three things about this cookie are worth knowing:</p>

      <ul>
        <li>
          <strong>It is only set when you log in.</strong> Browsing barbers as a
          visitor sets no cookie at all.
        </li>
        <li>
          <strong>No script can read it.</strong> It is marked "HttpOnly", which
          means JavaScript in your browser cannot access it. If this site ever
          had a security flaw that let a malicious script run, that script still
          could not steal your login.
        </li>
        <li>
          <strong>It is not sent to other websites.</strong> It is marked
          "SameSite", so your browser will not attach it to requests made by
          other sites.
        </li>
      </ul>

      <h2>Cookies this site does not use</h2>

      <ul>
        <li>
          <strong>Analytics cookies.</strong>{" "}
          {appFacts.hasAnalytics
            ? "This site uses analytics. See below."
            : "None. There is no Google Analytics or any other analytics tool on this site, so there is nothing measuring or recording your behaviour."}
        </li>
        <li>
          <strong>Advertising cookies.</strong> None. No advertising or
          retargeting script of any kind.
        </li>
        <li>
          <strong>Third-party cookies.</strong> None. No other company's code
          runs on this site, so no other company can set a cookie through it.
        </li>
        <li>
          <strong>Social media cookies.</strong> None. No Facebook, Instagram or
          X widgets are embedded.
        </li>
      </ul>

      <h2>Other things loaded from other companies</h2>

      <p>
        Cookies are not the only way information reaches a third party. Simply
        loading a font, a map or a video from another company's server sends them
        your IP address and the page you are on, whether or not a cookie is
        involved.
      </p>

      <p>
        {appFacts.thirdPartyEmbeds.length === 0 ? (
          <>
            This site loads <strong>nothing</strong> from another company. No
            Google Fonts, no maps, no embedded video, no icon library from a
            content delivery network. Everything your browser downloads comes
            from this site. The text you are reading uses a font already
            installed on your own device.
          </>
        ) : (
          <>
            This site loads almost nothing from another company. There is one
            deliberate exception, listed below -- everything else your
            browser downloads still comes from this site, including the font
            you are reading.
          </>
        )}
      </p>

      {appFacts.thirdPartyEmbeds.length > 0 && (
        <ul>
          {appFacts.thirdPartyEmbeds.map((embed) => (
            <li key={embed.domain}>
              <strong>
                {embed.name} ({embed.domain}).
              </strong>{" "}
              {embed.purpose} {embed.when}
            </li>
          ))}
        </ul>
      )}

      <h2>Other storage in your browser</h2>

      <p>
        Some websites store information in your browser without using cookies,
        through features called local storage and session storage. This site does
        not. In particular, we deliberately do <em>not</em> keep your login token
        in local storage, because anything stored there can be read by
        JavaScript, which makes it far easier to steal. The login cookie
        described above is the safer approach.
      </p>

      <h2>Do you need to consent?</h2>

      <p>
        Rules in a number of places, including the UK and the EU, generally
        require a website to get your permission before setting cookies, but make
        an exception for cookies that are strictly necessary to provide a service
        you have asked for.
      </p>

      <p>
        The single cookie on this site exists so that logging in works. You only
        receive it if you choose to log in, and logging in cannot work without
        it. On that basis we treat it as strictly necessary and do not ask for
        consent. We are not claiming this is a legal certainty, and we would
        rather tell you our reasoning than show you a banner that gives you no
        real choice.
      </p>

      <h2>Controlling cookies yourself</h2>

      <p>
        You can delete cookies or block them entirely in your browser settings,
        under a heading such as Privacy, Cookies, or Site data. Every modern
        browser offers this.
      </p>

      <p>
        If you block cookies for this site, you can still browse barbers and see
        their services and prices. You will not be able to log in, because there
        would be nothing to remember your session, so you could not make or
        manage a booking.
      </p>

      <p>
        Logging out removes the cookie. It is cleared by our server, because your
        browser's JavaScript is not allowed to touch it.
      </p>

      <h2>Changes to this policy</h2>

      <p>
        If we add anything that sets a cookie or loads content from another
        company, we will update this page and the date at the top, and we will
        put a consent mechanism in place first where that is required.
      </p>

      <div className="bb-owner-note">
        <p>
          <strong>Owner note - read this before adding anything to the site.</strong>{" "}
          This page is accurate today. Each of the following would make it
          untrue, and most would mean you need a real consent banner that blocks
          the thing until the visitor agrees:
        </p>
        <ul>
          <li>Google Analytics, Plausible, Matomo, or any other analytics</li>
          <li>Meta Pixel, Google Ads, or any advertising or retargeting tag</li>
          <li>
            Google Fonts loaded from Google's servers. This sends every
            visitor's IP address to Google. A German court has already ruled
            against a site for exactly this. Self-host the font file instead, or
            use system fonts as this site does.
          </li>
          <li>An embedded Google Map</li>
          <li>
            An embedded YouTube video. Use the privacy-enhanced mode at minimum,
            and expect to need consent.
          </li>
          <li>A Facebook, Instagram or X feed or share widget</li>
          <li>A live chat widget</li>
          <li>A payment provider's script</li>
          <li>Any library loaded from a CDN rather than from your own server</li>
        </ul>
        <p>
          If you add any of them: update this page and the{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>, set the matching
          values in <code>client/src/config/business.js</code>, and do not load
          the non-essential ones until the visitor has actively agreed. A banner
          that loads trackers before you click it is worse than no banner,
          because it is a visible claim that is not true.
        </p>
      </div>

      <h2>Questions</h2>

      <p>
        Email <Placeholder value={business.email} /> if you have a question about
        this page.
      </p>

      <p>
        See also our <Link to="/privacy-policy">Privacy Policy</Link>,{" "}
        <Link to="/terms">Terms and Conditions</Link> and{" "}
        <Link to="/refund-policy">Refund Policy</Link>.
      </p>
    </div>
  </Container>
  );
};

export default CookiePolicyPage;
