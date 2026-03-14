"use client";

import { motion } from "framer-motion";
import { Flame, Rocket, Star, Trophy } from "lucide-react";

interface StreakWidgetProps {
  streak: number;
}

export default function StreakWidget({ streak }: StreakWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-500/10 border border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Rocket size={120} className="-rotate-45" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Fire/Streak Icon Container */}
        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.4)]"
          >
            <Flame size={48} className="fill-white" />
          </motion.div>
          
          {/* Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: -40,
                x: (i - 1) * 20
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full blur-[2px]"
            />
          ))}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/20">
              Racha de Ahorro
            </span>
            {streak >= 3 && (
              <span className="text-[10px] font-black bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-500/20 flex items-center gap-1">
                <Star size={10} fill="currentColor" /> Imbatible
              </span>
            )}
          </div>
          
          <h2 className="text-4xl font-black mb-2 tracking-tighter">
            {streak} {streak === 1 ? 'Compra' : 'Compras'} Seguidas
          </h2>
          
          <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xs">
            {streak === 0 
              ? "Hacé tu primera compra para activar tu racha y ganar premios."
              : "¡No pierdas el fuego! Hacé una compra antes del domingo para mantener tu nivel."}
          </p>
        </div>

        {/* Reward Progress */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center gap-2 min-w-[140px]">
          <div className="text-yellow-400 mb-1">
            <Trophy size={28} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Próximo Premio</p>
            <p className="text-xl font-black text-white">$1.000 OFF</p>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(streak % 5) * 20}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
