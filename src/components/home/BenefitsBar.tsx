"use client";

import React from "react";
import { CreditCard, MapPin, ShieldCheck, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: CreditCard,
    title: "Pagá como quieras",
    description: "Tarjetas, efectivo o Mercado Pago",
    linkText: "Ver más",
    href: "#",
  },
  {
    icon: MapPin,
    title: "Puntos de Retiro",
    description: "Retirá en Recoleta, Palermo o Belgrano",
    linkText: "Ver puntos",
    href: "/como-funciona",
  },
  {
    icon: TrendingDown,
    title: "Ahorro Real",
    description: "Precios directos de fábrica",
    linkText: "Calculá tu ahorro",
    href: "#",
  },
  {
    icon: ShieldCheck,
    title: "Compra Protegida",
    description: "Tu dinero seguro hasta el retiro",
    linkText: "Ver garantía",
    href: "#",
  },
];

export default function BenefitsBar() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 group cursor-pointer border-r border-black/5 last:border-r-0 pr-4"
            >
              <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0 group-hover:bg-[#FF5C00] transition-colors border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                <Icon size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-black text-black uppercase tracking-tight">{benefit.title}</h4>
                <p className="text-[11px] text-black/50 font-medium leading-tight mb-1">{benefit.description}</p>
                <span className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                  {benefit.linkText}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
