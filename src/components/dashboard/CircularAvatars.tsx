"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

interface CircularAvatarsProps {
  current: number;
  min: number;
  participants?: any[];
}

export function CircularAvatars({ current, min, participants = [] }: CircularAvatarsProps) {
  const slots = Array.from({ length: min });

  return (
    <div className="flex -space-x-3 items-center">
      {slots.map((_, i) => {
        const isOccupied = i < current;
        const participant = participants[i];

        return (
          <div key={i} className="relative group">
            {isOccupied ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              >
                {participant?.avatar_url ? (
                  <img src={participant.avatar_url} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                ) : (
                  participant?.nombre?.charAt(0) || "U"
                )}
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300"
              >
                <User size={14} />
              </motion.div>
            )}
            
            {/* Tooltip simple */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {isOccupied ? (participant?.nombre || "Participante") : "Espacio vacío (Efecto Zeigarnik)"}
            </div>
          </div>
        );
      })}
      
      {current > 0 && (
        <span className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
          {min - current} Faltantes
        </span>
      )}
    </div>
  );
}
