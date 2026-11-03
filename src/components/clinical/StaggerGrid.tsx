import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
  risePx?: number;
}

export function StaggerGrid({
  children,
  className,
  staggerMs = 50,
  risePx = 24,
}: StaggerGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerMs / 1000,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : risePx },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, idx) => (
        <motion.div key={idx} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

