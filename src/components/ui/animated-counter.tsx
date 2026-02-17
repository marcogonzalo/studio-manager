"use client";

import { useRef, useEffect, useState } from "react";
import {
  useInView,
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  /** Target number to count to */
  target: number;
  /** Duration of the counting animation in seconds */
  duration?: number;
  /** Prefix text (e.g., "+", "$") */
  prefix?: string;
  /** Suffix text (e.g., "%", "+", "k") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to animate only once */
  once?: boolean;
  /** When true (default), animate on mount so content always shows. When false, animate only when scrolling into view. */
  triggerOnMount?: boolean;
}

export function AnimatedCounter({
  target,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  once = true,
  triggerOnMount = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInViewObserver = useInView(ref, {
    once,
    amount: 0.1,
    margin: "0px 0px 80px 0px",
    initial: !triggerOnMount,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isInView = triggerOnMount ? mounted : isInViewObserver;
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  // Handle Infinity case - show ∞ symbol directly
  if (target === Infinity) {
    return (
      <motion.span
        ref={ref}
        className={cn("tabular-nums", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.4 }}
      >
        {prefix}∞{suffix}
      </motion.span>
    );
  }

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, target, {
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      });

      const unsubscribe = motionValue.on("change", (latest) => {
        setDisplayValue(
          latest.toLocaleString("es-ES", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        );
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [isInView, target, duration, decimals, motionValue]);

  return (
    <motion.span
      ref={ref}
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}
