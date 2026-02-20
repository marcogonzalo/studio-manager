"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Animation direction: "up" slides from below, "down" from above, "left"/"right" from sides, "none" for fade only */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Distance in pixels for the slide effect */
  distance?: number;
  /** How much of the element must be visible to trigger (0-1) */
  threshold?: number;
  /** Whether to animate only once or every time it enters view */
  once?: boolean;
  /** When true (default), animate on mount so content always shows. When false, animate only when scrolling into view. */
  triggerOnMount?: boolean;
  /** HTML tag to render */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "span";
}

const motionByTag = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  footer: motion.footer,
  span: motion.span,
} as const satisfies Record<
  NonNullable<AnimatedSectionProps["as"]>,
  typeof motion.div
>;

function useInViewOnLoad(ref: React.RefObject<HTMLElement | null>) {
  const [inViewOnLoad, setInViewOnLoad] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top < viewportHeight && rect.bottom > 0) {
        setInViewOnLoad(true);
      }
    };
    check();
    requestAnimationFrame(check);
    const t = setTimeout(check, 100);
    return () => clearTimeout(t);
  }, [ref]);
  return inViewOnLoad;
}

export function AnimatedSection({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 30,
  threshold = 0.05,
  once = true,
  triggerOnMount = true,
  as = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const inViewOnLoad = useInViewOnLoad(ref);
  const isInViewObserver = useInView(ref, {
    once,
    amount: threshold,
    margin: "0px 0px 80px 0px",
    initial: !triggerOnMount,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isInView = triggerOnMount ? mounted : isInViewObserver || inViewOnLoad;

  const effectiveDuration = reducedMotion ? 0 : duration;
  const effectiveDistance = reducedMotion ? 0 : distance;

  const directionOffset = {
    up: { x: 0, y: effectiveDistance },
    down: { x: 0, y: -effectiveDistance },
    left: { x: effectiveDistance, y: 0 },
    right: { x: -effectiveDistance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const MotionComponent = motionByTag[as];

  return (
    <MotionComponent
      ref={ref}
      className={cn(className)}
      initial={{
        opacity: 0,
        x: directionOffset[direction].x,
        y: directionOffset[direction].y,
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : {
              opacity: 0,
              x: directionOffset[direction].x,
              y: directionOffset[direction].y,
            }
      }
      transition={{
        duration: effectiveDuration,
        delay: reducedMotion ? 0 : delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </MotionComponent>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** How much of the container must be visible to trigger */
  threshold?: number;
  once?: boolean;
  /** When true (default), animate on mount so content always shows. When false, animate only when scrolling into view. */
  triggerOnMount?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  threshold = 0.05,
  once = true,
  triggerOnMount = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const inViewOnLoad = useInViewOnLoad(ref);
  const isInViewObserver = useInView(ref, {
    once,
    amount: threshold,
    margin: "0px 0px 80px 0px",
    initial: !triggerOnMount,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isInView = triggerOnMount ? mounted : isInViewObserver || inViewOnLoad;
  const effectiveStaggerDelay = reducedMotion ? 0 : staggerDelay;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: effectiveStaggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 20,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}) {
  const reducedMotion = useReducedMotion();
  const d = reducedMotion ? 0 : distance;
  const directionOffset = {
    up: { x: 0, y: d },
    down: { x: 0, y: -d },
    left: { x: d, y: 0 },
    right: { x: -d, y: 0 },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: {
          opacity: 0,
          x: directionOffset[direction].x,
          y: directionOffset[direction].y,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: reducedMotion ? 0 : 0.5,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
