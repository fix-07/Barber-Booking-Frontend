import React, { useEffect, useRef, useState } from "react";
import { MapPin, Check, Loader2 } from "lucide-react";

import api from "../../api/axios";

/**
 * City/region suggestions while typing, backed by the free OpenStreetMap
 * Nominatim search (proxied through our own server -- see
 * controllers/geocodeController.js for why it is a proxy, not a direct
 * browser call).
 *
 * ==========================================================================
 *  NEVER GUESSES SILENTLY
 * ==========================================================================
 *
 * Typing alone never sets `locationConfirmed`. Only actually PICKING one
 * of the suggestions does that -- which is also the only time real
 * latitude/longitude get attached to the form. If the person keeps typing
 * after picking one (correcting a mistake, changing their mind), the
 * confirmation is cleared again: the coordinates on file must always match
 * what is currently displayed, never a stale pick for a different city
 * the text has since moved on from.
 *
 * A person who never picks a suggestion can still submit the form with
 * whatever they typed -- manual correction always works, per the brief --
 * they simply save without map coordinates, which the barber's profile and
 * public listing both already treat as a normal, honest state (no map
 * shown, nothing claimed).
 */
const LocationField = ({ value, onChange, error, required }) => {
  const [query, setQuery] = useState(value.city || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Keep the visible text in sync if the parent resets the form.
  useEffect(() => {
    setQuery(value.city || "");
  }, [value.city]);

  // Close the suggestion list on an outside click.
  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (text) => {
    clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounced client-side on top of the server's own rate limit
    // (geocodeRoutes.js) -- this is what keeps a person typing a whole
    // city name from firing one request per keystroke.
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get("/geocode/search", { params: { q: text } });
        setSuggestions(data.results || []);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleTyping = (event) => {
    const text = event.target.value;
    setQuery(text);
    search(text);

    // Typing again after a confirmed pick means the pick may no longer
    // match -- clear the confirmation and coordinates rather than let
    // them silently go stale. The city TEXT is kept (manual correction
    // stays possible), only the "this is a verified point on the map"
    // claim is withdrawn.
    onChange({
      city: text,
      region: value.region,
      country: value.country,
      latitude: null,
      longitude: null,
      locationConfirmed: false,
    });
  };

  const pickSuggestion = (place) => {
    setQuery(place.city || place.displayName);
    setSuggestions([]);
    setIsOpen(false);
    onChange({
      city: place.city || place.displayName,
      region: place.region,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      locationConfirmed: true,
    });
  };

  return (
    <div className="bb-authfield" ref={containerRef}>
      <label className="bb-authfield-label" htmlFor="location-city">
        City or town
        {required && <span className="bb-authfield-required" aria-hidden="true">*</span>}
      </label>

      <div className={"bb-authfield-control has-icon" + (error ? " is-invalid" : "")}>
        <span className="bb-authfield-icon" aria-hidden="true">
          <MapPin size={18} strokeWidth={1.75} />
        </span>
        <input
          id="location-city"
          className="bb-authfield-input"
          value={query}
          onChange={handleTyping}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          autoComplete="off"
          placeholder="Start typing a city..."
          aria-invalid={error ? "true" : undefined}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        {isSearching && (
          <span className="bb-authfield-icon" aria-hidden="true">
            <Loader2 size={16} className="bb-spin" />
          </span>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="bb-location-suggestions" role="listbox">
          {suggestions.map((place) => (
            <li key={`${place.latitude},${place.longitude}`}>
              <button
                type="button"
                className="bb-location-suggestion"
                onClick={() => pickSuggestion(place)}
              >
                {place.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="bb-authfield-error">{error}</p>}

      {/*
        The location is displayed clearly BEFORE saving, and the wording
        is honest about which state it is in -- confirmed (real
        coordinates on file) vs just typed text (no map, nothing claimed).
      */}
      {value.locationConfirmed ? (
        <p className="bb-location-status bb-location-confirmed">
          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
          Location confirmed: {[value.city, value.region, value.country].filter(Boolean).join(", ")}
        </p>
      ) : (
        query.trim().length > 0 && (
          <p className="bb-location-status">
            Typed manually -- not matched to a map point. Pick a suggestion above to show your shop on the map.
          </p>
        )
      )}
    </div>
  );
};

export default LocationField;
