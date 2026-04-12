"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import HeroCarousel from "./HeroCarousel";

interface HeroProps {
  deals: any[];
}

export default function Hero({ deals }: HeroProps) {
  return (
    <section className="relative w-full bg-white border-b border-black">
      {/* Brutalist Grid Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-black/5" />
        <div className="absolute top-0 left-2/4 w-[1px] h-full bg-black/5" />
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-black/5" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row min-h-[80vh]">
        {/* TEXT SIDE */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center border-r border-black">
          <div className="inline-block bg-bandha-primary text-white text-[10px] font-black uppercase px-3 py-1 mb-10 self-start border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            EL FUTURO DE LAS COMPRAS
          </div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black text-black leading-[0.8] tracking-[-0.06em] uppercase mb-12">
            Bandha <br />
            <span className="text-bandha-primary">Club</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-black font-medium leading-tight tracking-tight mb-16 max-w-lg">
            Unite a tus vecinos para conseguir <span className="underline decoration-4 decoration-bandha-primary">precios de fábrica</span>. Directo. Brutal. Eficaz.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link 
              href="/productos"
              className="bg-bandha-primary text-white font-black py-5 px-10 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-sm uppercase tracking-widest text-center"
            >
              Comprar Ahora
            </Link>
            <Link 
              href="/como-funciona"
              className="bg-white text-black font-black py-5 px-10 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-sm uppercase tracking-widest text-center"
            >
              Conocer más
            </Link>
          </div>
        </div>

        {/* CAROUSEL SIDE */}
        <div className="flex-1 bg-bandha-subtle/30 flex items-center justify-center p-4 min-h-[400px]">
           <HeroCarousel deals={deals} />
        </div>
      </div>
    </section>
  );
}
