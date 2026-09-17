import React from "react";
import { MessageCircle } from "lucide-react";

import { getWhatsAppLink } from "../utils/whatsapp";

/**
 * "Contact on WhatsApp" -- renders NOTHING if the number cannot be safely
 * linked. See utils/whatsapp.js for exactly what "safely" means here
 * (a stated country code, never a guessed one).
 *
 * A real, ordinary link -- target="_blank" opens wa.me in a new tab, which
 * on a phone with WhatsApp installed hands off to the app itself via
 * wa.me's own redirect; there is no separate "app vs browser" branch to
 * write here. rel="noopener noreferrer" stops the new tab from getting a
 * handle back to this page.
 */
const WhatsAppButton = ({ phone, message, className = "" }) => {
  const href = getWhatsAppLink(phone, message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // outline-success rather than a colour tied to either the light
      // Bootstrap pages or the dark redesigned ones -- this component is
      // used on both (BarberDetailPage.js and the newer BarberCard.js).
      className={`btn btn-outline-success ${className}`.trim()}
    >
      <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
      {" "}Contact on WhatsApp
    </a>
  );
};

export default WhatsAppButton;
