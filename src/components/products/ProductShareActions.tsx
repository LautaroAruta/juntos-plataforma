"use client";

import React from "react";
import { Share2, Link as LinkIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ProductShareActionsProps {
  productName: string;
  price: number;
  productId: string;
  baseUrl: string;
}

export default function ProductShareActions({ productName, price, productId, baseUrl }: ProductShareActionsProps) {
  const { data: session } = useSession();
  const referralCode = (session?.user as any)?.referral_code;
  
  const shareUrl = referralCode 
    ? `${baseUrl}/productos/${productId}?ref=${referralCode}` 
    : `${baseUrl}/productos/${productId}`;
    
  const shareText = referralCode
    ? `¡Mirá esta oferta en BANDHA! 🐧 ${productName} a solo $${price.toLocaleString()}. Si te unís con mi código, ¡nos ahorramos todos y ganamos premios! Sumate acá: ${shareUrl}`
    : `¡Mirá esta oferta en BANDHA! 🐧 ${productName} a solo $${price.toLocaleString()}. Si nos unimos, ahorramos todos. Sumate acá: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("¡Enlace copiado!", {
      description: "El link se guardó en tu portapapeles. ¡Pegalo en tu grupo de WhatsApp!"
    });
  };

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
        title="WhatsApp"
      >
        <Share2 size={18} />
      </a>
      <button
        onClick={handleCopyLink}
        className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
        title="Copiar link"
      >
        <LinkIcon size={18} />
      </button>
    </div>
  );
}
