"use client";

import React from "react";
import { Egg, Baby, Bird, Crown, Info } from "lucide-react";
import { calculateLevel, calculateLevelProgress, LEVELS } from "@/lib/gamification";
import { motion } from "framer-motion";

interface LevelBadgeProps {
  xp: number;
  showProgress?: boolean;
}

const ICONS: Record<string, any> = {
  Egg,
  Baby,
  Bird,
  Crown,
};

export default function LevelBadge({ xp, showProgress = true }: LevelBadgeProps) {
  const currentLevel = calculateLevel(xp);
  const progress = calculateLevelProgress(xp);
  const Icon = ICONS[currentLevel.icon] || Egg;
  
  const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center ${currentLevel.color}`}>
          <Icon size={32} />
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Rango JUNTOS</div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{currentLevel.name}</h3>
        </div>
      </div>

      {showProgress && (
        <div className="space-y-3">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{xp.toLocaleString()} XP</span>
            {nextLevel ? (
              <span>Próximo Nivel: {nextLevel.name}</span>
            ) : (
              <span className="text-[#00AEEF]">Nivel Máximo</span>
            )}
          </div>
          
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#00AEEF] to-[#00A650] rounded-full"
            />
          </div>
          
          {nextLevel && (
            <p className="text-[11px] text-slate-500 font-medium">
              Faltan {(nextLevel.minXp - xp).toLocaleString()} XP para subir de nivel.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
