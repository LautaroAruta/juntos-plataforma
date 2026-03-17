"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Timer, Users } from "lucide-react";
import CountdownTimer from "@/components/shared/CountdownTimer";
import { motion } from "framer-motion";

interface ProductCardProps {
  deal?: any;
  product?: any;
}

export default function ProductCard({ deal, product: directProduct }: ProductCardProps) {
  const product = deal?.product || directProduct;
  
  if (!product) return null;

  const hasDeal = !!deal;
  const progress = hasDeal ? (deal.participantes_actuales / deal.min_participantes) * 100 : 0;
  const percentageSaved = hasDeal 
    ? Math.round(((product.precio_individual - deal.precio_actual) / product.precio_individual) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#009EE3]/10 transition-all duration-500 flex flex-col border border-gray-50 relative h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-50">
        <img 
          src={product.imagen_principal || "/placeholder-product.jpg"} 
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {hasDeal && percentageSaved > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-br from-[#009EE3] to-[#00A650] px-3 py-1.5 rounded-xl shadow-md border border-white/20">
            <span className="text-white font-black text-[9px] uppercase tracking-widest">{percentageSaved}% AHORRO</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-gray-800 font-black text-[17px] leading-tight mb-4 group-hover:text-[#009EE3] transition-colors line-clamp-2 min-h-[2.8rem]">
          {product.nombre}
        </h3>
        
        <div className="space-y-1 mb-6">
          {hasDeal ? (
            <>
              <p className="text-gray-400 text-xs font-medium line-through ml-1">
                ${product.precio_individual.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 bg-[#00A650]/5 border border-[#00A650]/10 px-3 py-2.5 rounded-[1.25rem] w-fit shadow-sm relative overflow-hidden">
                <p className="text-[22px] font-black text-gray-900 tracking-tighter leading-none">
                  ${deal.precio_actual.toLocaleString()}
                </p>
                <div className="flex flex-col border-l border-[#00A650]/20 pl-2 leading-[0.8]">
                    <span className="text-[8px] font-black text-[#00A650] uppercase tracking-tighter">PRECIO</span>
                    <span className="text-[8px] font-black text-[#00A650] uppercase tracking-tighter">GRUPAL</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-[22px] font-black text-gray-900 tracking-tighter leading-none">
                ${product.precio_individual.toLocaleString()}
              </p>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter ml-1">PRECIO INDIVIDUAL</span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
          {hasDeal && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-gray-50 text-[#009EE3] flex items-center justify-center shrink-0 border border-gray-100">
                    <Users size={12} />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                    ¡{deal.participantes_actuales} / {deal.min_participantes} unidos!
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <CountdownTimer 
                      targetDate={deal.fecha_vencimiento} 
                      showIcon={true} 
                      className="font-black text-[10px]" 
                      iconSize={14}
                      variant="simple"
                  />
                </div>
              </div>
              
              {/* FOMO Label */}
              {deal.min_participantes - deal.participantes_actuales <= 3 && deal.min_participantes - deal.participantes_actuales > 0 && (
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-widest text-center animate-pulse">
                      ¡Solo quedan {deal.min_participantes - deal.participantes_actuales} plazas!
                  </p>
              )}

              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-[#00A650] to-[#009EE3] rounded-full relative"
                />
              </div>
            </div>
          )}

          {!hasDeal && (
            <div className="pb-2">
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Llega gratis mañana</p>
            </div>
          )}

          <Link 
            href={`/productos/${product.id}`}
            className="w-full bg-[#F8F9FA] hover:bg-[#009EE3] hover:shadow-lg hover:shadow-[#009EE3]/20 text-gray-800 hover:text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center text-xs uppercase tracking-tight group/btn border border-gray-100"
          >
            {hasDeal ? "Ver oferta" : "Ver detalle"}
            <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
