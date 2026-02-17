"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const staggerDelay = 0.08;

export function BenefitsList({ benefits }: { benefits: string[] }) {
  return (
    <motion.ul
      className="mt-8 space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
    >
      {benefits.map((benefit) => (
        <motion.li
          key={benefit}
          className="flex list-none items-center gap-3"
          variants={{
            hidden: { opacity: 0, x: 15 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1],
              },
            },
          }}
        >
          <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
          <span>{benefit}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
