"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only apply custom cursor on devices that support hover (fine pointers like mouse/trackpad)
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    // Add active class to html to trigger cursor: none in styles
    document.documentElement.classList.add("custom-cursor-active");

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use GSAP quickSetter for high-performance positioning
    const setX = gsap.quickSetter(cursor, "x", "px");
    const setY = gsap.quickSetter(cursor, "y", "px");

    const onMouseMove = (e: MouseEvent) => {
      setX(e.clientX);
      setY(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    // Context-sensitive hover states
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Detect if hover target is inside text input/textarea/editable
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.hasAttribute("contenteditable") ||
        target.closest("[contenteditable]");

      if (isInput) {
        // Hide the custom cursor and let standard text I-beam display
        gsap.to(cursor, {
          opacity: 0,
          scale: 0,
          duration: 0.15,
        });
        return;
      }

      // Check if target is interactive/clickable
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-pointer") ||
        target.getAttribute("role") === "button";

      if (isClickable) {
        // Smoothly expand the cursor ball when hovering clickable elements
        gsap.to(cursor, {
          scale: 2.2,
          opacity: 0.9,
          duration: 0.25,
          ease: "power2.out",
        });
      } else {
        // Return to normal size
        gsap.to(cursor, {
          scale: 1,
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor-ball fixed top-0 left-0 w-2.5 h-2.5 bg-white rounded-full pointer-events-none z-99999 -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      style={{ willChange: "transform" }}
    />
  );
}
