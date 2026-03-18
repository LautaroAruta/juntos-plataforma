"use client";

import { motion } from "framer-motion";
import { Leaf, Share2, Award, Zap, Trees, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ImpactStats {
  totalCarbon: number;
  totalDistance: number;
  tokensEarned: number;
  treeEquivalent: number;
}

export default function SocialImpactPassport({ stats, neighborhood }: { stats: ImpactStats, neighborhood: string }) {
  const handleShare = () => {
    const text = `¡Estoy ahorrando en grupo y ayudando al planeta! Evité ${stats.totalCarbon.toFixed(1)}kg de CO2 en ${neighborhood} con JUNTOS. 🌳✨`;
    if (navigator.share) {
      navigator.share({ title: 'Mi Impacto Social', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Resumen copiado para compartir");
    }
  };

  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="bg-green-500 p-1 rounded-lg">
                  <Leaf size={14} className="text-white" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Pasaporte de Impacto</span>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Ciudadano de {neighborhood}</h3>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/20 flex items-center justify-center border-4 border-white/10"
          >
            <Award size={32} />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
             <div className="flex items-center gap-2 text-white/50 mb-2">
                <Leaf size={14} />
                <span className="text-[9px] font-black uppercase">CO2 Evitado</span>
             </div>
             <p className="text-2xl font-black">{stats.totalCarbon.toFixed(1)} <span className="text-xs text-white/40">kg</span></p>
          </div>
          
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
             <div className="flex items-center gap-2 text-white/50 mb-2">
                <Trees size={14} />
                <span className="text-[9px] font-black uppercase">Equiv. Árboles</span>
             </div>
             <p className="text-2xl font-black">{stats.treeEquivalent.toFixed(1)}</p>
          </div>

          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm col-span-2">
             <div className="flex items-center justify-between">
                <div>
                   <div className="flex items-center gap-2 text-white/50 mb-1">
                      <MapPin size={14} />
                      <span className="text-[9px] font-black uppercase">Distancia Logística Reducida</span>
                   </div>
                   <p className="text-xl font-black">{stats.totalDistance.toFixed(0)} <span className="text-xs text-white/40">km</span></p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                   <Zap size={24} fill="currentColor" />
                </div>
             </div>
          </div>
        </div>

        <button 
          onClick={handleShare}
          className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl"
        >
          <Share2 size={18} />
          Compartir mi Orgullo Social
        </button>
      </div>
    </div>
  );
}
