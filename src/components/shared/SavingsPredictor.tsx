"use client";

import { TrendingDown, Users, Sparkles, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface SavingsPredictorProps {
  currentParticipants: number;
  minParticipants: number;
  individualPrice: number;
  dealPrice: number;
  productName: string;
}

export default function SavingsPredictor({
  currentParticipants,
  minParticipants,
  individualPrice,
  dealPrice,
  productName
}: SavingsPredictorProps) {
  const unitsToGoal = Math.max(0, minParticipants - currentParticipants);
  const individualSavings = individualPrice - dealPrice;
  const collectiveSavings = individualSavings * minParticipants;
  
  // Si falta poco para el objetivo, mostramos un mensaje más urgente
  const isCloseToGoal = unitsToGoal <= 3 && unitsToGoal > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#009EE3]/5 to-[#00A650]/5 rounded-[2.5rem] p-8 border border-[#009EE3]/10 relative overflow-hidden group"
    >
      {/* Decorative Sparkles */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={64} className="text-[#009EE3]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#009EE3] tracking-widest mb-6 px-1">
          <TrendingDown size={14} /> Inteligencia Colectiva BANDHA
        </div>

        <h3 className="text-xl font-black text-gray-800 tracking-tighter mb-6 leading-tight">
          {isCloseToGoal ? (
            <>¡Faltan solo <span className="text-[#009EE3]">{unitsToGoal} vecinos</span> para <br /> activar el precio mayorista!</>
          ) : (
            <>Unite al grupo y asegurá <br /> el ahorro barrial</>
          )}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-3xl border border-white shadow-sm transition-transform hover:scale-[1.02]">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ahorrás vos</div>
            <div className="text-2xl font-black text-gray-800 tracking-tighter">
              ${individualSavings.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#00A650]/10 backdrop-blur-sm p-5 rounded-3xl border border-[#00A650]/10 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="text-[9px] font-bold text-[#00A650] uppercase tracking-widest mb-1">Ahorra el barrio</div>
            <div className="text-2xl font-black text-[#00A650] tracking-tighter">
              ${collectiveSavings.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium text-gray-500 leading-relaxed px-1">
            Al comprar en grupo, eliminamos intermediarios y logística ineficiente. 
            Ese ahorro se traduce directamente en <span className="text-gray-800 font-bold">precios más bajos para todos</span>.
          </p>

          <button 
            onClick={() => {
              const text = `¡Vecinos! 👋 Faltan solo ${unitsToGoal} para activar el descuento en ${productName}. ¡Si nos unimos, pagamos $${dealPrice.toLocaleString()} en vez de $${individualPrice.toLocaleString()}! Sumate acá: ${window.location.href}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full bg-white border-2 border-[#009EE3] text-[#009EE3] hover:bg-[#009EE3] hover:text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm shadow-sm group/btn active:scale-95"
          >
            <Share2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
            Impulsar ahorro barrial
          </button>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#009EE3]/20 to-transparent blur-3xl pointer-events-none" />
    </motion.div>
  );
}
