"use client";

import { RefreshCw, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";

interface SubscriptionToggleProps {
  isSubscription: boolean;
  onToggle: (val: boolean) => void;
  individualPrice: number;
  dealPrice: number;
}

export default function SubscriptionToggle({
  isSubscription,
  onToggle,
  individualPrice,
  dealPrice
}: SubscriptionToggleProps) {
  const subscriptionPrice = dealPrice * 0.95; // 5% extra discount for subscriptions

  return (
    <div className="grid grid-cols-1 gap-3 w-full">
      <button
        onClick={() => onToggle(false)}
        className={`relative p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
          !isSubscription 
            ? 'border-[#009EE3] bg-blue-50/50 shadow-md' 
            : 'border-gray-100 bg-white hover:border-gray-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            !isSubscription ? 'bg-[#009EE3] text-white' : 'bg-gray-50 text-gray-400'
          }`}>
            {!isSubscription ? <Check size={20} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-gray-800 uppercase tracking-tight">Compra Única</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asegura el precio grupal</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-gray-800 tracking-tighter">${dealPrice.toLocaleString()}</div>
        </div>
      </button>

      <button
        onClick={() => onToggle(true)}
        className={`relative p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group overflow-hidden ${
          isSubscription 
            ? 'border-[#00A650] bg-green-50/50 shadow-md' 
            : 'border-gray-100 bg-white hover:border-gray-200'
        }`}
      >
        {/* Shine effect for premium subscription */}
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Zap size={32} className="text-[#00A650]" />
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isSubscription ? 'bg-[#00A650] text-white' : 'bg-gray-50 text-gray-400'
          }`}>
            {isSubscription ? <Check size={20} /> : <RefreshCw size={20} />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="text-sm font-black text-gray-800 uppercase tracking-tight">Suscribirme (Fijo)</div>
              <span className="bg-[#00A650] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter animate-bounce">
                -5% Extra
              </span>
            </div>
            <div className="text-[10px] font-bold text-[#00A650] uppercase tracking-widest">Automático & más barato</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-[#00A650] tracking-tighter">${subscriptionPrice.toLocaleString()}</div>
          <div className="text-[9px] font-bold text-gray-400 line-through">${dealPrice.toLocaleString()}</div>
        </div>
      </button>
    </div>
  );
}
