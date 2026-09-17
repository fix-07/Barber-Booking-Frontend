import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

/**
 * STYLESHEETS, in load order. Order matters.
 *
 *   1. Bootstrap first, so our own rules can override it rather than the
 *      other way round. It is imported from node_modules and NOT a CDN on
 *      purpose: a CDN would send every visitor's IP address to another
 *      company, which would make the Cookie Policy's "nothing loads from a
 *      third party" claim untrue.
 *   2. veyron.css      -- the design tokens, base type, and the component
 *                         overrides that re-point Bootstrap's own CSS
 *                         variables at our palette.
 *   3. veyron-site.css -- the shell and the public pages, which depend on
 *                         the tokens above existing.
 *   4. veyron-auth.css -- the authentication screens.
 *   5. veyron-barber.css -- the barber's own dashboard (also reused by
 *                         MyBookingsPage.js, the customer's dashboard).
 *
 * The earlier stylesheets (theme.css, auth.css, forms.css,
 * appointment-picker.css, admin.css) are still in src/styles/ and are also
 * in _backup-20260915-134042/, but nothing imports them: veyron.css
 * REPLACES that system rather than layering on top of it, so there is one
 * place that decides how the product looks. Pages not yet rebuilt on the
 * new system render with the new base styles -- plain, but readable and in
 * the right palette -- until their own pass.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/veyron.css";
import "./styles/veyron-bridge.css";
import "./styles/veyron-site.css";
import "./styles/veyron-auth.css";
import "./styles/veyron-barber.css";

// Pages not yet rebuilt on the new system. They are written against the old
// --bb-* token names, which veyron-bridge.css above aliases onto the new
// palette. Each import here disappears as its pages are rebuilt.
import "./styles/admin.css";
import "./styles/forms.css";
import "./styles/appointment-picker.css";

import store from "./store/store";
import App from "./App";

/**
 * The entry point. React attaches to <div id="root"> in public/index.html.
 *
 * THE ORDER OF THESE WRAPPERS MATTERS:
 *
 *   Provider        gives every component access to the Redux store.
 *   BrowserRouter   gives every component access to the URL and <Link>.
 *
 * Provider is outside because some components read Redux state to decide what
 * to render for a route (the header's nav links, for example).
 *
 * StrictMode is a development-only helper. It deliberately runs some code
 * twice to surface bugs, which is why you may see two requests in the Network
 * tab while developing. That does NOT happen in the production build.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Opting into both v7 flags now, rather than leaving the console
          warning in place: neither changes any behaviour this app relies
          on (no relative-splat routes, no code depends on updates NOT
          being batched in a transition), and it means the v7 upgrade
          later is not a routing behaviour change, just a version bump. */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
