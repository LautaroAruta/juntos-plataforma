"use client";

import { motion } from "framer-motion";
import { Zap, Users, ArrowRight } from "lucide-react";

interface HotDealProps {
  productName: string;
  currentParticipants: number;
  targetParticipants: number;
  priceDrop: string;
}

export default function HotDealCard({ productName, currentParticipants, targetParticipants, priceDrop }: HotDealProps) {
  const missing = targetParticipants - currentParticipants;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-orange-50 border border-orange-100 rounded-3xl p-5 relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
        <Zap size={48} className="text-orange-600" fill="currentColor" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-3 text-orange-600">
           <Zap size={14} fill="currentColor" />
           <span className="text-[10px] font-black uppercase tracking-widest">¡OPORTUNIDAD AHORA!</span>
        </div>

        <h4 className="text-sm font-black text-gray-800 mb-1 leading-tight">{productName}</h4>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-4">
          Faltan <span className="text-orange-600 font-black">{missing} {missing === 1 ? 'persona' : 'personas'}</span> para bajar <span className="text-orange-600 font-black">${priceDrop}</span>
        </p>

        <div className="flex items-center justify-between gap-4">
           <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-orange-50 bg-orange-200" />
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-orange-50 bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-600">
                +{currentParticipants}
              </div>
           </div>
           
           <button className="bg-orange-600 text-white p-2 rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors">
              <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}
