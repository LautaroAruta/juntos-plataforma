"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Users, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="flex-1 bg-gradient-to-r from-[#00AEEF] to-[#0077CC] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#00AEEF]/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={24} />
      ) : (
        <>
          <Users size={24} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase opacity-80">Unirse al grupo</span>
            <span className="text-lg">COMPRAR JUNTOS</span>
          </div>
        </>
      )}
    </button>
  );
}
