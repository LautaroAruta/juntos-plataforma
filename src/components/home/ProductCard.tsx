"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Timer, Users } from "lucide-react";
import CountdownTimer from "@/components/shared/CountdownTimer";
import GroupAvatars from "@/components/group-deals/GroupAvatars";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

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
      className="group bg-bandha-surface rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-bandha-primary/10 transition-all duration-500 flex flex-col border border-bandha-border relative h-full hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-bandha-subtle border-b border-bandha-border flex-shrink-0">
        <img 
          src={product.imagen_principal || "/placeholder-product.jpg"} 
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {hasDeal && percentageSaved > 0 && (
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/20">
            <span className="bg-gradient-to-br from-[#009EE3] to-[#00A650] bg-clip-text text-transparent font-black text-[11px] uppercase tracking-widest">{percentageSaved}% AHORRO</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-bandha-text font-black text-[17px] leading-tight mb-4 group-hover:text-bandha-primary transition-colors line-clamp-2 h-[2.6rem] overflow-hidden">
          {product.nombre}
        </h3>
        
        <div className="space-y-1 mb-6">
          {hasDeal ? (
            <>
              <p className="text-bandha-text-muted text-xs font-medium line-through ml-1" suppressHydrationWarning>
                {formatCurrency(product.precio_individual)}
              </p>
              <div className="flex items-center gap-2 bg-bandha-secondary/5 border border-bandha-secondary/10 px-3 py-2.5 rounded-[1.25rem] w-fit shadow-sm relative overflow-hidden">
                <p className="text-[22px] font-black text-bandha-text tracking-tighter leading-none tabular-nums" suppressHydrationWarning>
                  {formatCurrency(deal.precio_actual)}
                </p>
                <div className="flex flex-col border-l border-bandha-secondary/20 pl-2 leading-[0.8]">
                    <span className="text-[11px] font-black text-bandha-secondary uppercase tracking-tighter">PRECIO</span>
                    <span className="text-[11px] font-black text-bandha-secondary uppercase tracking-tighter">GRUPAL</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-[22px] font-black text-bandha-text tracking-tighter leading-none tabular-nums" suppressHydrationWarning>
                {formatCurrency(product.precio_individual)}
              </p>
              <span className="text-[11px] font-black text-bandha-text-muted uppercase tracking-tighter ml-1">PRECIO INDIVIDUAL</span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
          {hasDeal && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <GroupAvatars
                  current={deal.participantes_actuales}
                  min={deal.min_participantes}
                  compact
                />
                
                <div className="flex flex-col items-end gap-1 shrink-0">
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
                  <p className="text-[11px] font-black text-brand-danger uppercase tracking-widest text-center animate-pulse">
                      ¡Solo quedan {deal.min_participantes - deal.participantes_actuales} plazas!
                  </p>
              )}

              <div className="h-1.5 w-full bg-bandha-subtle rounded-full overflow-hidden relative shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-bandha-secondary to-bandha-primary rounded-full relative"
                />
              </div>
            </div>
          )}

          {!hasDeal && (
            <div className="pb-2">
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Llega gratis mañana</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Link 
              href={`/productos/${product.id}`}
              className="w-full bg-bandha-subtle hover:bg-bandha-primary hover:shadow-lg hover:shadow-bandha-primary/20 text-bandha-text hover:text-white font-black py-4 rounded-xl transition-all flex items-center justify-center text-xs uppercase tracking-tight group/btn border border-bandha-border"
            >
              {hasDeal ? "Ver oferta" : "Ver detalle"}
              <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
