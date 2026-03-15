"use client";

import { Trophy, Target, Users, Clock, Flame, ChevronRight, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useChallengeStore, Challenge } from "@/store/challengeStore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import TopContributors from "./TopContributors";

export default function NeighborhoodChallenge({ neighborhoodId }: { neighborhoodId: string }) {
  const { activeChallenges, loading, fetchNeighborhoodChallenges, fetchTopContributors, topContributors } = useChallengeStore();

  useEffect(() => {
    fetchNeighborhoodChallenges(neighborhoodId);
  }, [neighborhoodId, fetchNeighborhoodChallenges]);

  if (loading && activeChallenges.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded-full mb-6" />
        <div className="h-24 bg-gray-50 rounded-3xl" />
      </div>
    );
  }

  if (activeChallenges.length === 0) return null;

  const mainChallenge = activeChallenges[0];
  const progress = (mainChallenge.current_value / mainChallenge.target_value) * 100;
  const contributors = topContributors[mainChallenge.id] || [];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-[#00A650] flex items-center justify-center shadow-lg shadow-green-200">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Desafío: {mainChallenge.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Meta Colectiva de tu Barrio</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-orange-500 mb-1">
              <Clock size={14} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-tighter">
                {formatDistanceToNow(new Date(mainChallenge.deadline), { locale: es, addSuffix: false })}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
          {mainChallenge.description}
        </p>

        {/* PROGRESS BAR */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-800 tracking-tighter">
                {mainChallenge.type === 'savings_goal' ? `$${mainChallenge.current_value.toLocaleString()}` : mainChallenge.current_value}
              </span>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                / {mainChallenge.type === 'savings_goal' ? `$${mainChallenge.target_value.toLocaleString()}` : mainChallenge.target_value}
              </span>
            </div>
            <div className="bg-[#00A650] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {Math.floor(progress)}% Completado
            </div>
          </div>

          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50 relative">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-400 via-[#00A650] to-[#009EE3] relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-full" />
                {progress > 80 && (
                  <motion.div 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"
                  />
                )}
             </motion.div>
          </div>
        </div>

        {/* REWARD PREVIEW */}
        <div className="mt-8 p-5 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Award className="text-[#009EE3]" size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Premio del Barrio</div>
              <div className="text-sm font-black text-blue-600 tracking-tight">{mainChallenge.perk_description}</div>
            </div>
          </div>
          <button className="p-2 transition-transform active:scale-90 text-blue-400 hover:text-blue-600">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* CALL TO ACTION */}
        <div className="mt-6 flex items-center justify-between px-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <Flame size={12} className="text-orange-500 fill-orange-500" /> ¡Sumate y empujá al barrio!
           </p>
           <button className="text-[10px] font-black text-[#00A650] uppercase tracking-widest hover:underline transition-all">
             Cómo contribuir
           </button>
        </div>

        {/* TOP CONTRIBUTORS LIST */}
        <div className="mt-8 pt-8 border-t border-gray-50">
          <TopContributors challengeId={mainChallenge.id} />
        </div>
      </div>
    </div>
  );
}
