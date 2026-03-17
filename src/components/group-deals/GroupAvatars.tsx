"use client";

import { motion } from "framer-motion";
import { User, Plus } from "lucide-react";

interface GroupAvatarsProps {
  current: number;
  min: number;
  /** Compact mode for ProductCard (smaller avatars) */
  compact?: boolean;
}

/**
 * Modular circular avatars exploiting the Zeigarnik effect.
 * 
 * Smart overflow: when there are many slots, it collapses to:
 *   [filled][filled][+N more] [empty] "¡Faltan X!"
 * This prevents overflow in cards while keeping the Zeigarnik tension.
 */
export default function GroupAvatars({ current, min, compact = false }: GroupAvatarsProps) {
  const size = compact ? "w-7 h-7" : "w-10 h-10";
  const fontSize = compact ? "text-[10px]" : "text-xs";
  const iconSize = compact ? 10 : 14;
  const remaining = min - current;

  // Smart limit: show max N individual circles
  const maxVisible = compact ? 3 : 4;

  // How many filled circles to show individually
  const filledToShow = Math.min(current, maxVisible);
  const extraFilled = current - filledToShow;

  // Show 1 empty slot if there are remaining (Zeigarnik trigger)
  const showEmptySlot = remaining > 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2 items-center">
        {/* Filled (confirmed) avatars */}
        {Array.from({ length: filledToShow }).map((_, i) => (
          <motion.div
            key={`filled-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            className={`${size} rounded-full border-2 border-white bg-gradient-to-br from-[#00A650] to-[#009EE3] flex items-center justify-center text-white ${fontSize} font-black shadow-sm`}
          >
            <User size={iconSize} strokeWidth={2.5} />
          </motion.div>
        ))}

        {/* "+N" overflow counter */}
        {extraFilled > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: filledToShow * 0.08, type: "spring", stiffness: 300 }}
            className={`${size} rounded-full border-2 border-white bg-slate-700 flex items-center justify-center text-white ${fontSize} font-black shadow-sm`}
          >
            +{extraFilled}
          </motion.div>
        )}

        {/* Single empty slot (Zeigarnik trigger) */}
        {showEmptySlot && (
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`${size} rounded-full border-2 border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center text-slate-300`}
          >
            <Plus size={iconSize - 2} strokeWidth={2.5} />
          </motion.div>
        )}
      </div>

      {remaining > 0 && (
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-black text-slate-500 uppercase tracking-tight whitespace-nowrap ml-1`}>
          {remaining === 1 ? '¡Falta 1!' : `¡Faltan ${remaining}!`}
        </span>
      )}
      {remaining <= 0 && (
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-black text-[#00A650] uppercase tracking-tight whitespace-nowrap ml-1`}>
          ¡Completo!
        </span>
      )}
    </div>
  );
}
