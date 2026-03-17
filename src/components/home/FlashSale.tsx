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
      <div className="relative bg-gradient-to-br from-bandha-primary to-bandha-secondary rounded-[3rem] overflow-hidden shadow-2xl shadow-bandha-primary/20">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={300} className="text-white -rotate-12 translate-x-20 -translate-y-20" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-8 md:p-16">
          {/* Image Section */}
          <div className="flex-1 w-full lg:w-auto">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square md:aspect-video lg:aspect-square bg-bandha-surface rounded-[2.5rem] overflow-hidden shadow-xl"
            >
              <img 
                src={deal.product.imagen_principal || "/placeholder-product.jpg"} 
                alt={deal.product.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 bg-amber-400 text-black font-black px-6 py-2 rounded-2xl shadow-lg border-2 border-white">
                <span className="text-sm uppercase tracking-widest">{percentageSaved}% OFF</span>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-white space-y-8">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 flex items-center gap-2">
                <Zap size={14} strokeWidth={2.5} className="text-yellow-400 fill-yellow-400" />
                Super Oferta del Día
              </span>
              <CountdownTimer 
                targetDate={deal.fecha_vencimiento} 
                className="bg-black/20 text-white border border-white/10" 
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

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/80">
                <span>Progreso del grupo</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>

            <Link 
              href={`/productos/${deal.product.id}`}
              className="inline-flex items-center gap-4 bg-white dark:bg-amber-400 text-bandha-secondary dark:text-black font-black py-5 px-12 rounded-[2rem] shadow-2xl hover:scale-[1.05] active:scale-[0.98] transition-all text-lg uppercase tracking-tight group"
            >
              Unirme a la oferta
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
