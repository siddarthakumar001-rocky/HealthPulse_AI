import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function LiquidCursor() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring configuration for smooth motion
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guard: Only mount for precision pointer devices with hover capability
    const mql = window.matchMedia("(pointer: fine) and (hover: hover)");
    setIsPointerDevice(mql.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointerDevice(e.matches);
    };

    mql.addEventListener("change", handleMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer");

      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      mql.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  // If touch device or reduced motion is requested, do not render custom cursor
  if (!isPointerDevice || shouldReduceMotion) {
    return null;
  }

  const color = theme === "dark" ? "rgba(13, 148, 136, 0.9)" : "rgba(15, 118, 110, 0.85)";
  const glowColor = theme === "dark" ? "rgba(45, 212, 191, 0.35)" : "rgba(13, 148, 136, 0.2)";

  return (
    <>
      <style>
        {`
          .cursor-none * {
            cursor: none !important;
          }
        `}
      </style>

      {/* Outer Glow Layer */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] rounded-full blur-[6px]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: glowColor,
          scale: isHovering ? 2.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-[10000] rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: color,
          scale: isHovering ? 1.8 : 1,
          boxShadow: theme === "dark" ? "0 0 10px rgba(45, 212, 191, 0.8)" : "none",
        }}
      />
    </>
  );
}
