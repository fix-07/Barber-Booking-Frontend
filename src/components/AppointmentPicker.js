import React from "react";
import { DayPicker } from "react-day-picker";
import { Spinner } from "react-bootstrap";

import {
  formatTimeOnly,
  dateToInputValue,
  inputValueToDate,
} from "../utils/format";

/**
 * A calendar beside a list of real, bookable times.
 *
 * ============================================================
 *  WHERE THIS CAME FROM
 * ============================================================
 * Ported from a shadcn/Tailwind/TypeScript "appointment picker". This project
 * is Create React App with React Bootstrap and plain JavaScript, so the
 * original could not be dropped in. The calendar engine underneath,
 * react-day-picker, is framework-agnostic and is the part genuinely worth
 * keeping: it handles keyboard navigation, month paging and the ARIA grid
 * roles, which are tedious and easy to get wrong by hand.
 *
 * ============================================================
 *  THE DEPENDENCY LIST WAS EIGHT PACKAGES. WE INSTALLED ONE.
 * ============================================================
 *   react-day-picker   KEPT. The actual calendar.
 *   date-fns           skipped. Only used for one date label, and the browser
 *                      already does that with Intl.
 *   lucide-react       skipped. Two chevrons, inlined as SVG below.
 *   @radix-ui/react-slot,
 *   class-variance-authority
 *                      skipped. They exist only to build the shadcn Button,
 *                      and we have React Bootstrap.
 *   @radix-ui/react-scroll-area
 *                      skipped. A div with overflow-y:auto does the same.
 *   @radix-ui/react-toggle,
 *   @radix-ui/react-separator
 *                      skipped. Neither is imported by the demo at all.
 *
 * ============================================================
 *  THE DEMO'S TIME SLOTS WERE INVENTED. THESE ARE REAL.
 * ============================================================
 * The original hardcoded eighteen slots with made-up availability. Every slot
 * here comes from GET /api/bookings/availability, which only ever returns times
 * inside the barber's opening hours, and marks a slot unavailable when it is
 * genuinely taken.
 *
 * We also grey out days the barber is closed, using their published opening
 * hours, so a customer is not invited to pick a Sunday only to be told no.
 */

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const AppointmentPicker = ({
  date,                 // "YYYY-MM-DD" or ""
  onDateChange,         // (value: "YYYY-MM-DD") => void
  workingHours = [],
  maxDaysAhead = 180,
  availability,         // { slots, closed, timeZone } or null
  isLoadingSlots = false,
  selectedSlot,         // ISO string or ""
  onSlotSelect,         // (isoString) => void
}) => {
  const selectedDate = inputValueToDate(date);

  // Midnight today, so "before today" compares dates rather than moments.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastBookableDay = new Date(today);
  lastBookableDay.setDate(lastBookableDay.getDate() + maxDaysAhead);

  /**
   * Which weekdays this barber actually opens. Used to grey out closed days.
   *
   * A calendar date has the same weekday everywhere in the world, so reading
   * getDay() here is safe. Timezone only matters for the exact moment of an
   * appointment, which the server handles.
   */
  const openWeekdays = new Set(
    (workingHours || []).filter((entry) => entry.isOpen).map((entry) => entry.day)
  );

  const isClosedDay = (candidate) =>
    openWeekdays.size > 0 && !openWeekdays.has(candidate.getDay());

  const disabledDays = [
    { before: today },
    { after: lastBookableDay },
    isClosedDay,
  ];

  const handleSelect = (picked) => {
    // react-day-picker passes undefined when you click the selected day again.
    if (!picked) return;
    onDateChange(dateToInputValue(picked));
  };

  const slots = (availability && availability.slots) || [];
  const freeCount = slots.filter((slot) => slot.available).length;

  /** A readable heading for the chosen day, using the browser's own locale. */
  const dayHeading = selectedDate
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(selectedDate)
    : "";

  return (
    <div className="bb-picker">
      <div className="bb-picker-calendar">
        <DayPicker
          mode="single"
          selected={selectedDate || undefined}
          onSelect={handleSelect}
          disabled={disabledDays}
          startMonth={today}
          endMonth={lastBookableDay}
          showOutsideDays={false}
          /* Swap in our own chevrons so we do not pull in an icon package for
             two arrows. */
          components={{
            Chevron: (chevronProps) =>
              chevronProps.orientation === "left" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              ),
          }}
        />
      </div>

      <div className="bb-picker-times">
        {!date && (
          <p className="bb-picker-empty">
            Choose a date on the calendar to see available times.
          </p>
        )}

        {date && (
          <>
            {/* h3, not h4. The card above this is an h2 ("Book an
                appointment"), and jumping straight to h4 leaves a gap in the
                outline that reads as a missing section to anyone navigating
                by headings. */}
            <h3 className="bb-picker-day-heading">{dayHeading}</h3>

            {isLoadingSlots && (
              <div className="d-flex align-items-center gap-2 px-3" role="status">
                <Spinner animation="border" size="sm" aria-hidden="true" />
                <span className="small">Loading times.</span>
              </div>
            )}

            {!isLoadingSlots && availability && availability.closed && (
              <p className="bb-picker-empty">
                The shop is closed on this date. Please choose another day.
              </p>
            )}

            {!isLoadingSlots &&
              availability &&
              !availability.closed &&
              slots.length === 0 && (
                <p className="bb-picker-empty">
                  No times are left on this date. Please choose another day.
                </p>
              )}

            {!isLoadingSlots && slots.length > 0 && (
              <>
                {/*
                  Announced politely when the day changes, so a screen-reader
                  user hears how many times are free without having to tab
                  through the whole list to find out.
                */}
                <p className="visually-hidden" aria-live="polite">
                  {freeCount} of {slots.length} times available on {dayHeading}
                </p>

                <ul className="bb-picker-slot-list">
                  {slots.map((slot) => {
                    const label = formatTimeOnly(
                      slot.startAt,
                      availability.timeZone
                    );
                    const isChosen = selectedSlot === slot.startAt;

                    return (
                      <li key={slot.startAt}>
                        <button
                          type="button"
                          className={`bb-picker-slot ${isChosen ? "is-chosen" : ""}`}
                          /* The right attribute for a button that stays
                             switched on. Read out as "pressed". */
                          aria-pressed={isChosen}
                          disabled={!slot.available}
                          onClick={() => onSlotSelect(slot.startAt)}
                        >
                          {label}
                          {!slot.available && (
                            <span className="visually-hidden">
                              , already booked
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <p className="bb-picker-note">
                  Times shown in {availability.timeZone}. Crossed out times are
                  already booked.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentPicker;
