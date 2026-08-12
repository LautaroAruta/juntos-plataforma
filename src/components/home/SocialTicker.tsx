"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Sparkles, MapPin } from "lucide-react";

const activities = [
  { id: 1, text: "Juan de Palermo reservó Orgánicos del Valle", icon: <Users size={14} />, neighborhood: "Palermo" },
  { id: 2, text: "Oferta de Yerba Mate alcanzó el 80% del quórum", icon: <TrendingUp size={14} />, neighborhood: "Villa Crespo" },
  { id: 3, text: "Nueva pieza exclusiva: Lámparas de Diseño", icon: <Sparkles size={14} />, neighborhood: "Belgrano" },
  { id: 4, text: "¡Barrio Norte desbloqueó el precio directo en Aceite!", icon: <TrendingUp size={14} />, neighborhood: "Barrio Norte" },
  { id: 5, text: "María se sumó al grupo de Limpieza", icon: <Users size={14} />, neighborhood: "Recoleta" },
];

export default function SocialTicker() {
  return (
    <div className="bg-brand-charcoal text-white py-1.5 overflow-hidden relative z-[60]">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex whitespace-nowrap gap-16 items-center"
      >
        {[...activities, ...activities].map((activity, idx) => (
          <div key={`${activity.id}-${idx}`} className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2 py-0.5 border border-white/10 rounded">
                <span className="text-[8px] font-black text-brand-camel uppercase tracking-[0.2em]">{activity.neighborhood}</span>
             </div>
             <span className="text-[11px] font-medium text-stone-400 flex items-center gap-2">
               {activity.text}
             </span>
             <div className="w-1 h-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
