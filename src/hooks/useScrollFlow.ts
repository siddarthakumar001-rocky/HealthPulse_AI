import { useState, useEffect } from "react";

export interface ScrollFlowState {
  scrollDirection: "up" | "down";
  scrollY: number;
  isScrolled: boolean;
}

export function useScrollFlow(threshold: number = 14): ScrollFlowState {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [scrollY, setScrollY] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? window.pageYOffset : 0;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.pageYOffset;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 20);

      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) > threshold) {
        setScrollDirection(diff > 0 ? "down" : "up");
        lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrollDirection, scrollY, isScrolled };
}

