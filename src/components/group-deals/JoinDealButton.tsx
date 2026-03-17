"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Users, Loader2, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function JoinDealButton({ dealId }: { dealId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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
      disabled={loading}
      className="w-full bg-[#00A650] hover:bg-[#008E4A] text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-[#00A650]/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <Users size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-base uppercase tracking-tight">Comprar en grupo</span>
        </>
      )}
    </button>
  );
}
