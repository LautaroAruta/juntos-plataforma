"use client";

import React from "react";
import { motion } from "framer-motion";
import { Timer, Zap, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import CountdownTimer from "@/components/shared/CountdownTimer";

interface Deal {
  id: string;
  min_participantes: number;
  participantes_actuales: number;
  precio_actual: number;
  fecha_vencimiento: string;
  product: {
    id: string;
    nombre: string;
    descripcion: string | null;
    imagen_principal: string | null;
    precio_individual: number;
  };
}

interface FlashSaleProps {
  deal: Deal;
}

export default function FlashSale({ deal }: FlashSaleProps) {
  if (!deal || !deal.product) return null;

  const progress = (deal.participantes_actuales / deal.min_participantes) * 100;
  const percentageSaved = Math.round(
    ((deal.product.precio_individual - deal.precio_actual) / deal.product.precio_individual) * 100
  );

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="relative bg-black border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,92,0,1)]">
        {/* Background Decorative Elements (Grid) */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white" />
          <div className="absolute top-0 left-2/4 w-[1px] h-full bg-white" />
          <div className="absolute top-0 left-3/4 w-[1px] h-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-8 md:p-14">
          {/* Image Section */}
          <div className="flex-1 w-full lg:w-auto">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative aspect-square md:aspect-video lg:aspect-square bg-white border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <img 
                src={deal.product.imagen_principal || "/placeholder-product.jpg"} 
                alt={deal.product.nombre}
                className="w-full h-full object-cover p-8"
              />
              <div className="absolute top-6 left-6 bg-[#FF5C00] text-white font-black px-4 py-2 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs uppercase tracking-[0.2em]">{percentageSaved}% OFF</span>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-white space-y-8">
            <div className="flex items-center gap-3">
              <span className="bg-white text-black px-3 py-1.5 border border-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,92,0,1)]">
                <Zap size={14} strokeWidth={3} className="text-[#FF5C00] fill-[#FF5C00]" />
                Super Oferta del Día
              </span>
              <CountdownTimer 
                targetDate={deal.fecha_vencimiento} 
                className="bg-black text-white border border-white/20 px-3 py-1.5 text-[11px] font-black" 
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
                {deal.product.nombre}
              </h2>
              <p className="text-white/80 text-lg line-clamp-2 font-medium">
                {deal.product.descripcion}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-white/60 text-sm font-bold line-through">
                  ${deal.product.precio_individual.toLocaleString()}
                </p>
                <p className="text-5xl font-black tracking-tighter tabular-nums text-white">
                  ${deal.precio_actual.toLocaleString()}
                </p>
              </div>
              <div className="h-16 w-[2px] bg-white/20 hidden md:block" />
              <div className="hidden md:block">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">
                  Participantes
                </p>
                <div className="flex items-center gap-2">
                  <Users size={20} strokeWidth={2.5} className="text-white" />
                  <span className="text-2xl font-black text-white">{deal.participantes_actuales}/{deal.min_participantes}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar (Brutalist) */}
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                <span>Progreso del grupo</span>
                <span className="text-white">{Math.round(progress)}% completado</span>
              </div>
              <div className="h-4 w-full bg-white/10 border border-white/20 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#FF5C00] relative"
                >
                   <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </motion.div>
              </div>
            </div>

            <Link 
              href={`/productos/${deal.product.id}`}
              className="inline-flex items-center justify-center gap-4 bg-white text-black font-black py-5 px-12 border border-black shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] transition-all text-sm uppercase tracking-widest group"
            >
              Unirme a la oferta
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
