"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import SubscriptionToggle from "@/components/shared/SubscriptionToggle";
import JoinDealButton from "@/components/group-deals/JoinDealButton";

interface ProductActionWrapperProps {
  dealId: string;
  productId: string;
  individualPrice: number;
  dealPrice: number;
  productName: string;
}

export default function ProductActionWrapper({
  dealId,
  productId,
  individualPrice,
  dealPrice,
  productName
}: ProductActionWrapperProps) {
  const [isSubscription, setIsSubscription] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SECTOR DE SELECCION (Suscripción vs Única) */}
      <div className="w-full">
        <SubscriptionToggle 
          isSubscription={isSubscription}
          onToggle={setIsSubscription}
          individualPrice={individualPrice}
          dealPrice={dealPrice}
        />
      </div>

      {/* BOTONES DE ACCION (Desktop) */}
      <div className="hidden md:flex flex-col gap-3 w-full mt-2">
        <div className="flex gap-3">
          <button className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center leading-none border border-gray-200">
            <span className="text-[10px] uppercase tracking-widest mb-1">Comprar Seguro</span>
            <span className="text-base">${individualPrice.toLocaleString()}</span>
          </button>
          
          <div className="flex-[2]">
            <JoinDealButton 
              dealId={dealId} 
              productId={productId}
              isSubscription={isSubscription}
            />
          </div>
        </div>
        
        <a 
          href={`https://wa.me/?text=${encodeURIComponent(`¡Mirá esta oferta en JUNTOS! 🐧 ${productName} a solo $${dealPrice.toLocaleString()}. Si nos unimos, ahorramos todos. Sumate acá: ${window.location.origin}/productos/${productId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-xl shadow-[#25D366]/20"
        >
          Compartir por WhatsApp
        </a>

        <p className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest">
          No se cobrará nada si el grupo no se completa.
        </p>
      </div>

      {/* FIXED ACTION BAR (Mobile) - Adaptado para mostrar el estado del toggle */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 pb-8 border-t border-gray-100 flex items-center gap-3 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <button className="flex-1 max-w-[120px] h-14 bg-gray-100 text-gray-600 font-black rounded-xl active:scale-95 flex flex-col items-center justify-center leading-none border border-gray-200">
          <span className="text-[9px] uppercase tracking-widest mb-1">Seguro</span>
          <span className="text-sm">${individualPrice.toLocaleString()}</span>
        </button>
        <div className="flex-[2] h-14 relative group">
          <JoinDealButton 
            dealId={dealId} 
            productId={productId}
            isSubscription={isSubscription}
          />
        </div>
      </div>
    </div>
  );
}
