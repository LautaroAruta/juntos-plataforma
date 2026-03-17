"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  min_participantes: number;
  participantes_actuales: number;
  precio_actual: number;
  fecha_vencimiento: string;
  product: {
    id: string;
    nombre: string;
    imagen_principal: string | null;
    precio_individual: number;
  };
}

interface HeroCarouselProps {
  deals: Deal[];
}

export default function HeroCarousel({ deals }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (deals.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [deals.length]);

  if (!deals || deals.length === 0) {
    return (
      <div className="w-[400px] h-[400px] bg-bandha-surface/10 rounded-[4rem] backdrop-blur-sm border border-bandha-border flex flex-col items-center justify-center p-8 text-center">
        <Users size={48} className="text-bandha-text/30 mb-4" />
        <p className="text-bandha-text/50 font-bold uppercase tracking-widest text-xs">
          Nuevas ofertas grupales próximamente
        </p>
      </div>
    );
  }

  const currentDeal = deals[currentIndex];
  if (!currentDeal || !currentDeal.product) return null;

  const missingParticipants = currentDeal.min_participantes - currentDeal.participantes_actuales;

  return (
    <div className="relative w-full max-w-[450px] aspect-square lg:aspect-auto lg:h-[450px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDeal.id}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col"
        >
          <div className="relative group w-full h-full bg-bandha-surface rounded-[3.5rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col border border-bandha-border">
            {/* Image Section */}
            <div className="relative h-1/2 overflow-hidden bg-bandha-subtle">
              <img
                src={currentDeal.product.imagen_principal || "/placeholder-product.jpg"}
                alt={currentDeal.product.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* FOMO Badge */}
              <div className="absolute top-6 left-6 bg-bandha-danger text-white px-4 py-2 rounded-2xl shadow-xl border border-white/30 animate-bounce shadow-red-900/20 transform-gpu antialiased">
                <p className="text-xs font-black uppercase tracking-tight">
                  {missingParticipants === 1 
                    ? "¡ÚLTIMO CUPO!" 
                    : `¡SOLO FALTAN ${missingParticipants}!`}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col flex-1 bg-bandha-surface">
              <div className="mb-2">
                <span className="text-[10px] font-black text-bandha-primary uppercase tracking-widest bg-bandha-primary/10 px-3 py-1 rounded-full">
                  Oferta Próxima a Cerrar
                </span>
              </div>
              <h3 className="text-bandha-text font-black text-xl leading-tight mb-4 line-clamp-2">
                {currentDeal.product.nombre}
              </h3>
              
              <div className="flex items-end gap-3 mb-6">
                <div>
                  <p className="text-bandha-text-muted text-sm font-bold line-through">
                    ${currentDeal.product.precio_individual.toLocaleString()}
                  </p>
                  <p className="text-3xl font-black text-bandha-secondary tracking-tighter">
                    ${currentDeal.precio_actual.toLocaleString()}
                  </p>
                </div>
                <div className="bg-bandha-secondary/10 px-3 py-2 rounded-xl border border-bandha-secondary/20">
                  <p className="text-bandha-secondary font-black text-xs uppercase tracking-widest">
                    Ahorro Masivo
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  href={`/productos/${currentDeal.product.id}`}
                  className="w-full bg-gradient-to-r from-bandha-primary to-bandha-secondary text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center text-sm uppercase tracking-tight shadow-lg shadow-bandha-primary/30 hover:shadow-bandha-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Unirme ahora
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Indicators */}
      {deals.length > 1 && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {deals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === idx ? "w-6 bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
