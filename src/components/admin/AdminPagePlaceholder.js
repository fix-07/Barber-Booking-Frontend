import React from "react";

/**
 * Stands in for an admin page not built yet. AdminLayout's topbar already
 * shows the page title (see pageTitleFor in AdminLayout.js), so this only
 * needs the body -- avoids a repeated heading.
 */
const AdminPagePlaceholder = ({ description }) => (
  <div className="bb-admin-placeholder">
    <p className="text-muted mb-0">{description}</p>
  </div>
);

export default AdminPagePlaceholder;
