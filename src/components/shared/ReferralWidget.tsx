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
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Users size={16} className="text-[#00AEEF]" /> Invitá Amigos
        </h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00AEEF]/40" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-slate-600 text-sm font-medium leading-relaxed">
          Compartí BANDHA y recibí <span className="text-[#0077CC] font-bold">beneficios exclusivos</span> cuando tus amigos completen su primera compra.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amigos</div>
            <div className="text-xl font-black text-slate-800">{referralStats?.totalReferrals || 0}</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganado</div>
            <div className="text-xl font-black text-slate-800">${referralStats?.totalEarned || 0}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative group">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-4 pr-12 text-xs font-mono text-slate-400 focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-[#00AEEF]"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
          >
            {copied ? "¡Copiado!" : "Copiar Link"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-[#00AEEF]/20 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Compartir
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <Gift size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premio Actual</p>
          <p className="text-sm font-bold text-slate-700">$500 por cada amigo</p>
        </div>
      </div>
    </div>
  );
}
