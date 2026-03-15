"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";

interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icon_name: string;
  creado_en: string;
}

interface BadgeGalleryProps {
  badges: Badge[];
}

export default function BadgeGallery({ badges }: BadgeGalleryProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Tus Medallas</h3>
      
      {badges.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 font-medium">Aún no tenés medallas. ¡Completá tu primer compra para empezar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const Icon = (LucideIcons as any)[badge.icon_name] || LucideIcons.Award;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-4 rounded-3xl bg-slate-50 border border-transparent hover:border-[#00AEEF]/20 hover:bg-white transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#00AEEF] mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h4 className="text-xs font-black text-slate-800 mb-1">{badge.nombre}</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-2">{badge.descripcion}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
