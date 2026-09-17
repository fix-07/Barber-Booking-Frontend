import React from "react";
import { Card } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

// react-leaflet's marker icon graphics are broken under a bundler by
// default -- Leaflet's own code guesses their file path from the current
// script's URL, which is meaningless once webpack has bundled everything.
// This is the standard, documented fix: point it at the same PNGs,
// imported as real bundled assets from the leaflet package we already
// installed (not a CDN -- these ship inside node_modules/leaflet), so
// nothing new is fetched from a third party at runtime.
// eslint-disable-next-line global-require
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/**
 * A free map, via OpenStreetMap + Leaflet -- no API key, no paid Google
 * Maps.
 *
 * ==========================================================================
 *  WHAT THIS DOES AND DOES NOT SHOW
 * ==========================================================================
 *
 * Only ever rendered for a barber's SHOP location, which is public by the
 * barber's own choice (see BarberProfile.locationConfirmed -- the caller,
 * BarberDetailPage.js, already checks this is true before rendering this
 * component at all). This never plots a customer's address; nothing in
 * this app collects one to begin with.
 *
 * ==========================================================================
 *  TILE USAGE
 * ==========================================================================
 *
 * OpenStreetMap's own tile server (tile.openstreetmap.org) is free but
 * rate-limited and meant for light use -- see
 * https://operations.osmfoundation.org/policies/tiles/. That is a genuine
 * constraint of the free option this project uses instead of a paid map
 * provider: a very high-traffic deployment would eventually need its own
 * tile server or a commercial tile provider. Documented here rather than
 * silently hit.
 *
 * "Get directions" opens OpenStreetMap's own directions page rather than
 * Google Maps, keeping this feature entirely on the free stack asked for.
 */
const BarberMap = ({ latitude, longitude, label }) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${latitude}%2C${longitude}`;

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title as="h3" className="h6 mb-3">
          Location
        </Card.Title>

        <div style={{ height: 260, borderRadius: 4, overflow: "hidden" }}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            {/* OpenStreetMap's standard tile layer. Attribution is
                required by OSM's tile usage policy, not optional
                styling. */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              {label && <Popup>{label}</Popup>}
            </Marker>
          </MapContainer>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-dark btn-sm mt-3"
        >
          <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" /> Get directions
        </a>
      </Card.Body>
    </Card>
  );
};

export default BarberMap;
