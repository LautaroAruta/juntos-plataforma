"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { MissionService } from "@/lib/services/missionService";

export default function NeighborhoodGoal({ neighborhood }: { neighborhood: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    MissionService.getNeighborhoodGoal(neighborhood).then(setData);
  }, [neighborhood]);

  if (!data) return null;

  const progress = (data.currentOrders / data.targetOrders) * 100;

  return (
    <div className="max-w-7xl mx-auto px-6 mb-12">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-[#00AEEF]/20 to-transparent blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                   <Target size={14} className="text-[#00AEEF]" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Meta Colectiva: {neighborhood}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/50">
                   <Clock size={12} /> Faltan {data.daysLeft} días
                </div>
             </div>
             
             <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-3">
                ¡Estamos a <span className="text-[#00AEEF]">{data.targetOrders - data.currentOrders} compras</span> del Jackpot!
             </h2>
             <p className="text-slate-400 text-sm font-medium italic">
                Si llegamos a las {data.targetOrders} compras este mes, ¡{data.reward}!
             </p>
          </div>

          <div className="w-full md:w-80 space-y-4">
             <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-black text-white/90">{data.currentOrders} / {data.targetOrders}</span>
                <span className="text-xs font-bold text-[#00AEEF] flex items-center gap-1">
                   <Zap size={14} fill="currentColor" /> {progress.toFixed(0)}% Completado
                </span>
             </div>
             <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-[#009EE3] to-[#00A650] rounded-full shadow-[0_0_20px_rgba(0,166,80,0.5)]"
                />
             </div>
             <div className="flex justify-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                   Ver detalles de la recompensa
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
