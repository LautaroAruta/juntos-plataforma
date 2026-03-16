"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Timer } from "lucide-react";
import CountdownTimer from "@/components/shared/CountdownTimer";
import { motion } from "framer-motion";

interface ProductCardProps {
  deal: any;
}

export default function ProductCard({ deal }: ProductCardProps) {
  if (!deal || !deal.product) return null;

  const progress = (deal.participantes_actuales / deal.min_participantes) * 100;
  const percentageSaved = Math.round(
    ((deal.product.precio_individual - deal.precio_actual) / deal.product.precio_individual) * 100
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#009EE3]/10 transition-all duration-500 flex flex-col border border-gray-50 relative"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-50">
        <img 
          src={deal.product.imagen_principal || "/placeholder-product.jpg"} 
          alt={deal.product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {percentageSaved > 0 && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-[#009EE3] font-black text-[10px] uppercase tracking-widest">{percentageSaved}% AHORRO</span>
          </div>
        )}
        
        {/* FOMO over image */}
        {deal.min_participantes - deal.participantes_actuales <= 3 && (
            <div className="absolute bottom-4 right-4 bg-[#E31B1B] text-white px-3 py-1.5 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                ¡Solo quedan {deal.min_participantes - deal.participantes_actuales} plazas!
            </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-gray-800 font-black text-lg leading-snug mb-4 group-hover:text-[#009EE3] transition-colors line-clamp-2 min-h-[3.5rem]">
          {deal.product.nombre}
        </h3>
        
        <div className="space-y-1 mb-8">
          <p className="text-gray-300 text-sm font-bold line-through">
            ${deal.product.precio_individual.toLocaleString()}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#009EE3] tracking-tighter">
              ${deal.precio_actual.toLocaleString()}
            </p>
            <span className="text-[10px] font-black text-[#00A650] uppercase tracking-widest bg-[#00A650]/5 px-2 py-1 rounded-lg">
                Precio Grupal
            </span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-50 space-y-6">
          {/* Progress & Timer */}
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A650] animate-pulse" />
                {deal.participantes_actuales} de {deal.min_participantes} unidos
              </span>
              <CountdownTimer targetDate={deal.fecha_vencimiento} showIcon={true} className="bg-transparent px-0 py-0" />
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#009EE3] to-[#00A650] rounded-full transition-all"
              />
            </div>
          </div>

          <Link 
            href={`/productos/${deal.product.id}`}
            className="w-full bg-gray-50 hover:bg-[#009EE3] hover:shadow-lg hover:shadow-[#009EE3]/20 text-gray-800 hover:text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center text-sm uppercase tracking-tight group/btn"
          >
            Ver oferta
            <ChevronRight size={18} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
