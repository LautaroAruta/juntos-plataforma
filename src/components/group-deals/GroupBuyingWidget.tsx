"use client";

import React from "react";
import { motion } from "framer-motion";
import GroupAvatars from "./GroupAvatars";
import { TrendingUp, Users } from "lucide-react";

interface GroupBuyingWidgetProps {
  current: number;
  min: number;
  expiresAt?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Signature Premium Group Buying Widget.
 * High-tech progress tracking with a violet-to-emerald gradient.
 */
export default function GroupBuyingWidget({ 
  current, 
  min, 
  expiresAt, 
  compact = false,
  className = ""
}: GroupBuyingWidgetProps) {
  const percentage = Math.min((current / min) * 100, 100);
  const remaining = min - current;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* ProgressBar (Modern High-Tech) */}
      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
           <div className="flex items-center gap-2">
              <div className="pulse-emerald">
                 <span></span>
                 <span></span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {percentage < 100 ? `Objetivo: ${min} Unidades` : '¡Objetivo alcanzado!'}
              </span>
           </div>
           <span className="text-[10px] font-bold text-brand-violet uppercase tracking-widest">
             {current} Reservados
           </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, percentage)}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-brand-violet to-brand-emerald rounded-full shadow-[0_0_12px_rgba(124,58,237,0.3)]"
          />
        </div>
      </div>

      {!compact && (
        <div className="flex items-center justify-between glass-card p-4 border-white/50">
          <div className="flex items-center gap-3">
             <GroupAvatars current={current} min={min} compact={compact} />
             <div className="flex flex-col">
               <span className="text-xs font-bold text-brand-midnight">Vecinos sumados</span>
               <span className="text-[10px] text-slate-400 font-medium">Faltan {remaining} para el precio directo</span>
             </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-violet/5 rounded-xl border border-brand-violet/10">
             <TrendingUp size={14} className="text-brand-violet" />
             <span className="text-[10px] font-bold text-brand-violet uppercase">Hot Deal</span>
          </div>
        </div>
      )}
    </div>
  );
}
