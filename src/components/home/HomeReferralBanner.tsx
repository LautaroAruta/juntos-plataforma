"use client";

import React from "react";
import { Gift, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function HomeReferralBanner() {
  const { data: session } = useSession();
  const referralCode = (session?.user as any)?.referral_code;

  const handleInvite = async () => {
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }

    const shareUrl = `${window.location.origin}?ref=${referralCode || ''}`;
    const shareText = `¡Unite a BANDHA! 🐧 Compramos en grupo para ahorrar de verdad. Si te registrás con mi link, ¡nos regalan $500 a cada uno! Sumate acá: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BANDHA | Compras en Grupo',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("¡Enlace copiado!", {
        description: "Envialo a tus vecinos por WhatsApp para ganar $500."
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div 
        onClick={handleInvite}
        className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-200 group cursor-pointer hover:scale-[1.01] transition-all"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
           <Gift size={200} className="text-white" />
        </div>
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">¡Ganá $500 por cada vecino! 🎁</h3>
          <p className="text-white/80 font-bold text-sm md:text-xl uppercase tracking-widest italic">
            Invitá a un amigo a su primera compra y sumá saldo en tu billetera.
          </p>
        </div>
        <div className="relative z-10">
           <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-white/30 transition-all text-base uppercase tracking-tight flex items-center gap-2">
             Quiero invitar <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </section>
  );
}
