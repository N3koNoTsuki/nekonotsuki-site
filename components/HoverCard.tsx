"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * framer-motion hover/tap micro-interaction. It never hides content (no
 * `initial` opacity), so the underlying markup is fully visible in SSR /
 * without JS — motion only layers a subtle lift on hover.
 */
export default function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}
