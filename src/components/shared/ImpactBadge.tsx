"use client";

import { motion } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

export default function ImpactBadge({ co2Amount, compact = false }: { co2Amount: number, compact?: boolean }) {
  if (co2Amount <= 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-green-500/10 border border-green-100 flex items-center gap-1.5 ${
        compact ? 'px-2 py-0.5' : 'px-3 py-1.5'
      }`}
    >
      <div className="bg-green-100 p-0.5 rounded-full text-green-600">
        <Leaf size={compact ? 10 : 12} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-black text-green-700 uppercase`}>
          -{co2Amount.toFixed(1)}kg CO2
        </span>
        {!compact && (
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Impacto Social</span>
        )}
      </div>
      {!compact && <Sparkles size={10} className="text-green-400 animate-pulse ml-0.5" />}
    </motion.div>
  );
}
