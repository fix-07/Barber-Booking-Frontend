import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import rootReducer from "../reducers";

/**
 * The Redux store: one object holding all app state.
 *
 * WHY redux-thunk:
 * A plain Redux action must be an object, but fetching from a server takes
 * time. Thunk lets an action creator return a FUNCTION instead, so it can
 * dispatch "loading", wait for Axios, then dispatch "success" or "failure".
 * Without it there is no clean way to do async work in classic Redux.
 *
 * WHY NOT Redux Toolkit:
 * You asked for traditional Redux, so this uses createStore and hand-written
 * reducers. Worth knowing: the Redux team now recommends Redux Toolkit for
 * new projects, and you will see deprecation notes about createStore in their
 * docs. This code works correctly as written; the note is about their
 * recommendation, not a bug. That is also why package.json pins redux 4
 * rather than redux 5, where createStore logs a deprecation warning into
 * your console on every page load.
 */

/**
 * Connects the Redux DevTools browser extension if it is installed, so you
 * can watch actions and state as you click around. It is the single most
 * useful debugging tool for Redux.
 *
 * SECURITY NOTE: this only exposes what is already in the store, and we keep
 * no token there. But it does let anyone with access to the machine inspect
 * the logged-in user's details, so we enable it in development only.
 */
const composeEnhancers =
  (process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
