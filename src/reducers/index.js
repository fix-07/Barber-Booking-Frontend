import { combineReducers } from "redux";

import authReducer from "./authReducer";
import barberReducer from "./barberReducer";
import serviceReducer from "./serviceReducer";
import bookingReducer from "./bookingReducer";
import adminReducer from "./adminReducer";
import settingsReducer from "./settingsReducer";
import verificationReducer from "./verificationReducer";
import notificationReducer from "./notificationReducer";
import reviewReducer from "./reviewReducer";

/**
 * Joins the reducers into one.
 *
 * The keys here become the shape of the whole store, so in a component:
 *   useSelector((state) => state.auth.user)
 *   useSelector((state) => state.barbers.list)
 *
 * Each reducer only ever sees its own slice, which is why they can all use a
 * variable called `state` without clashing.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  barbers: barberReducer,
  services: serviceReducer,
  bookings: bookingReducer,
  admin: adminReducer,
  settings: settingsReducer,
  verification: verificationReducer,
  notifications: notificationReducer,
  reviews: reviewReducer,
});

export default rootReducer;
