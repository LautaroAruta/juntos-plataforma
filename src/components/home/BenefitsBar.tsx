"use client";

import React from "react";
import { CreditCard, Truck, ShieldCheck, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: <CreditCard className="text-bandha-primary" size={24} />,
    title: "Pagá como quieras",
    description: "Tarjetas, efectivo o Mercado Pago",
    linkText: "Ver más",
    href: "#",
  },
  {
    icon: <Truck className="text-bandha-primary" size={24} />,
    title: "Envíos directos",
    description: "Logística coordinada a tu casa",
    linkText: "Cómo funciona",
    href: "/como-funciona",
  },
  {
    icon: <TrendingDown className="text-bandha-primary" size={24} />,
    title: "Ahorro Real",
    description: "Precios directos de fábrica",
    linkText: "Calculá tu ahorro",
    href: "#",
  },
  {
    icon: <ShieldCheck className="text-bandha-primary" size={24} />,
    title: "Compra Protegida",
    description: "Tu dinero seguro hasta el retiro",
    linkText: "Ver garantía",
    href: "#",
  },
];

export default function BenefitsBar() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="bg-bandha-surface rounded-[2rem] p-6 shadow-sm border border-bandha-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-bandha-subtle flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-black text-bandha-text uppercase tracking-tight">{benefit.title}</h4>
              <p className="text-[11px] text-bandha-text-secondary font-medium leading-tight mb-1">{benefit.description}</p>
              <span className="text-[10px] font-bold text-bandha-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                {benefit.linkText}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
