"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, ChevronRight } from "lucide-react";
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
    }, 6000);
    return () => clearInterval(timer);
  }, [deals.length]);

  if (!deals || deals.length === 0) return null;

  const currentDeal = deals[currentIndex];
  if (!currentDeal || !currentDeal.product) return null;

  const missingParticipants = currentDeal.min_participantes - currentDeal.participantes_actuales;

  return (
    <div className="w-full aspect-[4/5] bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDeal.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Image (Top) */}
          <div className="flex-[1.2] relative overflow-hidden bg-[#F5F5F7] flex items-center justify-center p-8">
             <img
              src={currentDeal.product.imagen_principal || "/placeholder-product.jpg"}
              alt={currentDeal.product.nombre}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Content (Bottom) */}
          <div className="flex-1 p-6 flex flex-col justify-between z-10 bg-white">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">Oferta Destacada</span>
              <h2 className="text-2xl font-black text-black leading-tight tracking-tighter line-clamp-2">
                {currentDeal.product.nombre}
              </h2>
            </div>
            
            <div className="flex items-end justify-between mt-4">
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Precio Grupal</p>
                  <p className="text-3xl font-black text-black tracking-tighter tabular-nums">
                    ${currentDeal.precio_actual.toLocaleString()}
                  </p>
               </div>
               
               <Link
                 href={`/productos/${currentDeal.product.id}`}
                 className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg hover:-translate-y-1"
               >
                 <ArrowRight size={20} />
               </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination indicators */}
      {deals.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5 z-20 bg-white/50 backdrop-blur-md px-3 py-2 rounded-full">
          {deals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentIndex === idx ? "w-6 bg-black" : "w-1.5 bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
