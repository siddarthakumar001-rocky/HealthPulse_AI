import { useState, useEffect } from "react";

export function useScrollFlow(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

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
