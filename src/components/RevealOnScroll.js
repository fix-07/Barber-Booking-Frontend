import React, { useEffect, useRef, useState } from "react";

/**
 * Fades and lifts its children into place ONCE, the first time they scroll
 * into view.
 *
 * ============================================================
 *  WHY A SMALL HOOK INSTEAD OF THE ANIMATION LIBRARY THE
 *  REFERENCE COMPONENT USED
 * ============================================================
 * framer-motion is a real, capable library. But look at what the reference
 * component actually did with it: a card that tilts in 3D to track the
 * mouse continuously, and background shapes that spin forever
 * (`repeat: Infinity`, 25-40 second loops). Both are things this project's
 * brief rules out directly -- "no cursor-following effects", "no excessive
 * animations" -- so installing the library would not have been "avoiding an
 * unnecessary library that happens to be used for banned effects", it would
 * have been installing a library FOR effects that are banned regardless of
 * how they are built.
 *
 * What is left once those are removed is one thing: a card fading and
 * rising into place a single time as it scrolls into view. That does not
 * need a library, so it is not one.
 *
 * ============================================================
 *  BEHAVIOUR
 * ============================================================
 * - Runs once. The IntersectionObserver disconnects itself the first time
 *   the element is seen, so scrolling past it again does nothing.
 * - Does nothing for anyone who has asked their system to reduce motion --
 *   see the matching rule in styles/theme.css, which forces this to its
 *   final state immediately rather than relying on the transition simply
 *   running very fast.
 * - Falls back to fully visible immediately if IntersectionObserver is not
 *   available at all, so a visitor on something unusual never ends up with
 *   permanently invisible content.
 */
const RevealOnScroll = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bb-reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
