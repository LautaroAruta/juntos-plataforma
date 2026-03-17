"use client";

import { useState } from "react";
import { Copy, Check, Share2, Users, Gift } from "lucide-react";

interface ReferralWidgetProps {
  referralCode: string;
  referralStats?: {
    totalReferrals: number;
    pendingReferrals: number;
    totalEarned: number;
  };
}

export default function ReferralWidget({ referralCode, referralStats }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/auth/registro/cliente?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "¡Unite a BANDHA!",
          text: "Comprá en grupo y ahorrá hasta un 50%. Usá mi link para un beneficio extra:",
          url: referralLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="bg-bandha-surface rounded-[2.5rem] p-8 shadow-xl shadow-bandha-primary/5 border border-bandha-border space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-bandha-text-muted flex items-center gap-2">
          <Users size={16} className="text-bandha-primary" /> Invitá Amigos
        </h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-bandha-primary animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-bandha-primary/40" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-bandha-text-secondary text-sm font-medium leading-relaxed">
          Compartí BANDHA y recibí <span className="text-bandha-primary font-bold">beneficios exclusivos</span> cuando tus amigos completen su primera compra.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bandha-subtle rounded-2xl p-4 border border-bandha-border">
            <div className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest mb-1">Amigos</div>
            <div className="text-xl font-black text-bandha-text">{referralStats?.totalReferrals || 0}</div>
          </div>
          <div className="bg-bandha-subtle rounded-2xl p-4 border border-bandha-border">
            <div className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest mb-1">Ganado</div>
            <div className="text-xl font-black text-bandha-text">${referralStats?.totalEarned || 0}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative group">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-bandha-subtle border border-bandha-border rounded-2xl py-4 pl-4 pr-12 text-xs font-mono text-bandha-text-muted focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-bandha-surface rounded-xl transition-all text-bandha-text-muted hover:text-bandha-primary"
          >
            {copied ? <Check size={18} className="text-bandha-secondary" /> : <Copy size={18} />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-bandha-subtle hover:bg-bandha-border text-bandha-text-secondary font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
          >
            {copied ? "¡Copiado!" : "Copiar Link"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-bandha-primary hover:bg-bandha-secondary text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-bandha-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Compartir
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-bandha-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Gift size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest">Premio Actual</p>
          <p className="text-sm font-bold text-bandha-text-secondary">$500 por cada amigo</p>
        </div>
      </div>
    </div>
  );
}
