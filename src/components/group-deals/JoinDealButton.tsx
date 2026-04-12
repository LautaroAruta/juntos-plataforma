"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Users, Loader2, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function JoinDealButton({ dealId, targetDate }: { dealId: string, targetDate?: string | Date }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const isExpired = targetDate ? new Date(targetDate).getTime() <= Date.now() : false;

  const handleJoin = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      // Call the RPC to join the deal
      const { error } = await supabase.rpc('join_group_deal', { target_deal_id: dealId });
      
      if (error) throw error;
      
      // Navigate to checkout or success
      router.push(`/checkout/${dealId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "¡Oferta Grupal en BANDHA!",
      text: "¡Mirá esta oferta genial de directo de fábrica! Comprando en grupo nos sale menos. ¡Sumate a mi grupo!",
      url: window.location.href, // Link actual de la página
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("¡Gracias por compartir!", {
          description: "Mientras más se sumen, más rápido se activa la oferta."
        });
      } else {
        // Fallback para navegadores de escritorio que no soporten Web Share API
        await navigator.clipboard.writeText(shareData.url);
        toast.success("¡Enlace copiado!", {
          description: "El link se guardó en tu portapapeles. ¡Pegalo en tu grupo de WhatsApp!"
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error compartiendo:", err);
      }
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={loading || isExpired}
      className={`w-full font-black py-4.5 px-8 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70 group uppercase text-[11px] tracking-[0.2em] ${
        isExpired 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
        : "bg-[#FF5C00] text-white hover:bg-[#FF7A00]"
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : isExpired ? (
        <>
          <ShoppingCart size={20} />
          <span className="text-base uppercase tracking-tight">Oferta Expirada</span>
        </>
      ) : (
        <>
          <Users size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-base uppercase tracking-tighter">Comprar en grupo</span>
        </>
      )}
    </button>
  );
}
