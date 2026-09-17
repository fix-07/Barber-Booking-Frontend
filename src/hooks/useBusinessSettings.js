import { useSelector } from "react-redux";

import staticBusiness from "../config/business";

/**
 * The live, admin-editable business details from GET /api/settings (see
 * actions/settingsActions.js, fetched once on app startup in App.js), with
 * the static config/business.js values as a fallback until that request
 * finishes -- or if it fails -- so the Footer and legal pages never flash
 * blank content and keep working even with the API unreachable.
 *
 * Centralised here so Footer.js and the four legal pages -- which all used
 * to `import business from "../config/business"` -- only need to swap that
 * one import for this hook, not reimplement the fallback each time.
 */
const useBusinessSettings = () => {
  const business = useSelector((state) => state.settings.business);
  return business || staticBusiness;
};

export default useBusinessSettings;
