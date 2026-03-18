"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users, Heart, Zap } from "lucide-react";
import { useSocialStore } from "@/store/socialStore";

interface NeighborWatchProps {
  productId: string;
  neighborhoodId?: string;
  productName: string;
  progress?: number;
  expiresInHours?: number;
}

export default function NeighborWatch({ 
  productId, 
  neighborhoodId = "Palermo",
  productName,
  progress = 0,
  expiresInHours = 24
}: NeighborWatchProps) {
  const { events } = useSocialStore();
  const [localInterest, setLocalInterest] = useState(0);

  // Status flags for urgency
  const isUrgentSpace = progress >= 80 && progress < 100;
  const isUrgentTime = expiresInHours <= 24 && progress < 100;

  // Filter events...
  const productEvents = events.filter(e => 
    (e.product_id === productId || e.target_name === productName) && 
    e.neighborhood_id === neighborhoodId
  );

  useEffect(() => {
    const baseInterest = Math.max(1, productEvents.length + Math.floor(Math.random() * 3) + 1);
    setLocalInterest(baseInterest);

    const interval = setInterval(() => {
      setLocalInterest(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(1, prev + change);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [productEvents.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden border rounded-3xl p-5 shadow-sm flex items-center gap-4 mb-6 transition-all ${
        isUrgentSpace || isUrgentTime 
        ? 'bg-amber-50/50 border-amber-200' 
        : 'bg-white/80 backdrop-blur-md border-[#009EE3]/20'
      }`}
    >
      <div className="relative">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          isUrgentSpace || isUrgentTime 
          ? 'bg-amber-100 text-amber-600' 
          : 'bg-[#009EE3]/10 text-[#009EE3]'
        }`}>
          {isUrgentTime ? <Zap size={24} className="fill-amber-600" /> : <Eye size={24} />}
        </div>
        <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full animate-pulse ${
          isUrgentSpace || isUrgentTime ? 'bg-amber-500' : 'bg-green-500'
        }`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">
            Pulso en {neighborhoodId}
          </p>
          {isUrgentTime && (
            <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
              ¡Últimas Horas!
            </span>
          )}
        </div>
        
        <h4 className={`text-base font-black mt-1 leading-tight ${
          isUrgentSpace || isUrgentTime ? 'text-amber-800' : 'text-slate-800'
        }`}>
          {isUrgentSpace 
            ? "¡Solo faltan unos pocos lugares!" 
            : isUrgentTime 
            ? "¡No te quedes afuera!" 
            : `${localInterest} vecinos viendo ahora`
          }
        </h4>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Users size={12} /> {localInterest} personas interesadas
          </span>
          {productEvents.length > 0 && (
             <span className="text-[10px] font-bold text-[#00A650] flex items-center gap-1">
              • <Users size={10} /> {productEvents.length} se unieron hoy
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(isUrgentSpace || isUrgentTime) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase shadow-lg shadow-amber-500/20"
          >
            Actuá Rápido ⏳
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 pointer-events-none">
        <Users size={80} />
      </div>
    </motion.div>
  );
}
