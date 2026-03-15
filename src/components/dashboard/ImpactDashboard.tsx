"use client";

import React from "react";
import { 
  TreeDeciduous, 
  Wind, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Heart,
  Droplets,
  Leaf,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";

interface ImpactDashboardProps {
  userCarbonSaved: number;
  neighborhoodName: string;
  neighborhoodCarbonTotal: number;
  neighborhoodSavingsTotal: number;
}

export default function ImpactDashboard({ 
  userCarbonSaved, 
  neighborhoodName, 
  neighborhoodCarbonTotal,
  neighborhoodSavingsTotal 
}: ImpactDashboardProps) {
  
  // Equivalencias simbólicas
  const treesEquivalence = (userCarbonSaved / 22).toFixed(2); // 1 árbol absorbe ~22kg de CO2 al año
  const kmEquivalence = (userCarbonSaved * 8).toFixed(1); // 1kg CO2 ~ 8km en auto promedio

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#00A650]/10 flex items-center justify-center text-[#00A650]">
          <Leaf size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Impacto Social & Eco</h2>
          <p className="text-slate-500 font-medium">Tu ahorro genera un cambio real en tu comunidad.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Mi Impacto Personal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#00A650] to-[#009EE3] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[#00A650]/20"
        >
          {/* Background graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-md">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Mi Huella Positiva</span>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
                Salvaste {userCarbonSaved.toLocaleString()} kg de CO2
              </h3>
              <p className="text-white/80 font-medium text-lg">
                Gracias a que elegís el modelo JUNTOS de retiro en el barrio, evitás transporte innecesario y empaques plásticos.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
                <TreeDeciduous className="mx-auto mb-3" size={32} />
                <p className="text-2xl font-black">{treesEquivalence}</p>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Árboles Salvos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
                <Wind className="mx-auto mb-3" size={32} />
                <p className="text-2xl font-black">{kmEquivalence}km</p>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">De Humo Evitado</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Orgullo Barrial */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
              <Users size={20} />
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight">Orgullo {neighborhoodName || 'Mi Barrio'}</h4>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>Ahorro Colectivo</span>
                <span className="text-[#00A650]">+12% vs mes anterior</span>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">${neighborhoodSavingsTotal.toLocaleString()}</p>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>CO2 Evitado Total</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{neighborhoodCarbonTotal.toLocaleString()} kg</p>
                <TrendingUp className="text-[#00A650] mb-1" size={20} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                <ShieldCheck size={18} className="text-[#009EE3]" />
                <span>3 Productores apoyados</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                <Heart size={18} className="text-[#00A650]" />
                <span>Comercio local fortalecido</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bonus Area: ¿Cómo se calcula? */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Logística Corta", icon: <MapPin size={16} />, desc: "Menos km de camionetas" },
          { label: "Sin Plásticos", icon: <Droplets size={16} />, desc: "Uso de bolsas propias" },
          { label: "Directo de Campo", icon: <Heart size={16} />, desc: "Sin cámaras frigoríficas" },
          { label: "Compra Grupal", icon: <Users size={16} />, desc: "Un solo viaje, varios pedidos" }
        ].map((item, i) => (
          <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{item.label}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
