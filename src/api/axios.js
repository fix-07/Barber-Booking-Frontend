import axios from "axios";

/**
 * One configured Axios instance that the whole app uses.
 *
 * Why a shared instance instead of calling axios.get() everywhere:
 * the settings below (especially withCredentials) must apply to EVERY
 * request. If one request forgets, that request silently fails to send the
 * login cookie and the user looks logged out for no visible reason.
 */
const api = axios.create({
  /**
   * In development this is just "/api". The dev server proxies anything
   * starting with /api to http://localhost:5000 (see "proxy" in
   * package.json). That keeps the browser on one origin, which means no
   * CORS and no cross-site cookie problems while you build.
   *
   * In production, set REACT_APP_API_URL to your API's full address if it
   * is hosted separately from the frontend.
   */
  baseURL: process.env.REACT_APP_API_URL || "/api",

  /**
   * THE MOST IMPORTANT LINE IN THIS FILE.
   *
   * Our login token lives in an httpOnly cookie, which JavaScript cannot
   * read. withCredentials tells the browser to attach cookies to the
   * request anyway. Without it every protected route returns 401 and the
   * app behaves as though login never worked.
   */
  withCredentials: true,

  headers: { "Content-Type": "application/json" },

  // Give up rather than hang forever if the server is unreachable.
  timeout: 15000,
});

/**
 * Turns any Axios failure into the same simple shape:
 *   { message, fieldErrors }
 *
 * Our backend replies with
 *   { message: "Please correct the highlighted fields.",
 *     errors: { email: "Enter a valid email address." } }
 * so forms can show each message beside the right input.
 */
export const extractError = (error) => {
  // The server answered with an error status.
  if (error.response) {
    const data = error.response.data || {};
    return {
      message: data.message || "That request could not be completed.",
      fieldErrors: data.errors || {},
      status: error.response.status,
    };
  }

  // The request went out but nothing came back: server down, wrong port,
  // or no network.
  if (error.request) {
    return {
      message:
        "Could not reach the server. Check that the backend is running, then try again.",
      fieldErrors: {},
      status: 0,
    };
  }

  // Something broke before the request was even sent.
  return {
    message: "Something went wrong. Please try again.",
    fieldErrors: {},
    status: 0,
  };
};

export default api;
