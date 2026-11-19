import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function ParallaxWrapper({ children, depth = 0.05, className = "", style = {} }: { children: React.ReactNode, depth?: number, className?: string, style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = e.clientX - innerWidth / 2;
      const mouseY = e.clientY - innerHeight / 2;
      
      x.set(mouseX * depth);
      y.set(mouseY * depth);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [depth, x, y]);

  if (isTouch) {
    return <div ref={ref} style={style} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ ...style, x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
