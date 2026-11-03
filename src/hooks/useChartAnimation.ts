import { useReducedMotion } from "framer-motion";

export function useChartAnimation(duration = 800) {
  const shouldReduceMotion = useReducedMotion();

  return {
    isAnimationActive: !shouldReduceMotion,
    animationDuration: shouldReduceMotion ? 0 : duration,
    animationEasing: "ease-out" as const,
  };
}

