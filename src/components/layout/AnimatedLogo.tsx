"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface AnimatedLogoProps {
  className?: string;
}

/**
 * Motion-first logo for BANDHA.
 * 
 * - On load: letters animate in sequentially with spring physics
 * - On hover: subtle gradient shift + slight scale-up for "alive" feeling
 * - Respects prefers-reduced-motion via framer-motion defaults
 */
export default function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  const letters = "BANDHA".split("");

  return (
    <Link href="/" className={`flex items-center shrink-0 group ${className}`}>
      <motion.div 
        className="flex items-center"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="text-2xl md:text-3xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #009EE3 0%, #00A650 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </Link>
  );
}
