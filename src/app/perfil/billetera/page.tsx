"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Wallet, 
  History, 
  Share2, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  Gift,
  Users,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [session]);

  const fetchWalletData = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/user/wallet");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      toast.error("Error al cargar la billetera");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!data?.referral_code) return;
    const link = `${window.location.origin}/auth/register?ref=${data.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopying(true);
    toast.success("¡Link copiado!");
    setTimeout(() => setCopying(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5C00]" size={48} strokeWidth={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-24 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-100 pb-16 relative">
          <div className="absolute -top-12 left-0 text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] opacity-40">
            FINANCIAL_ASSET_NODE
          </div>
          <div className="space-y-6">
             <Link 
              href="/perfil/compras"
              className="inline-flex items-center gap-3 text-slate-400 hover:text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] transition-all group"
            >
              <ChevronLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" /> Volver al Historial
            </Link>
            <h1 className="text-6xl md:text-8xl font-black font-serif text-black tracking-tighter leading-none">
              Mi <span className="text-gray-400 italic">Billetera</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-6 pl-1">
              Gestión de Créditos y Recompensas <span className="w-12 h-[1px] bg-stone-100" /> v2.1
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Main Balance Card */}
          <div className="lg:col-span-2 space-y-16">
            <div className="relative overflow-hidden bg-black text-white p-12 md:p-16 rounded-[2.5rem] shadow-2xl shadow-black/20 border border-white/5 group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gray-400/20 transition-all duration-1000" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-400 flex items-center justify-center text-white shadow-lg shadow-gray-400/30">
                                <Wallet size={32} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Saldo_Disponible</span>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none tabular-nums" suppressHydrationWarning>
                                {formatCurrency(data?.balance)}
                            </h2>
                            <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-4">
                                Estado: Sincronizado <span className="w-8 h-[1px] bg-white/10" /> Actualizado {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-3">
                                <Users size={18} className="text-gray-400" strokeWidth={1.5} />
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Nodos Referidos</span>
                            </div>
                            <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{data?.referral_count}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-3">
                                <TrendingUp size={18} className="text-gray-400" strokeWidth={1.5} />
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Beneficio Total</span>
                            </div>
                            <p className="text-4xl font-black text-white tabular-nums tracking-tighter" suppressHydrationWarning>
                                {formatCurrency(data?.history?.filter((h:any) => h.type === 'reward').reduce((acc:number, h:any) => acc + Number(h.amount), 0))}
                            </p>
                        </div>
                    </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-xl shadow-black/5">
                <div className="bg-[#F5F5F7] px-10 py-6 flex items-center justify-between border-b border-stone-100">
                    <div className="flex items-center gap-4">
                         <History size={20} className="text-gray-400" strokeWidth={1.5} />
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Registro de Movimientos</h3>
                    </div>
                </div>

                <div className="divide-y divide-stone-50">
                    {data?.history?.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center gap-8">
                            <div className="w-24 h-24 rounded-full border border-stone-100 bg-stone-50/50 flex items-center justify-center text-slate-200 shadow-inner">
                                <History size={40} strokeWidth={1} />
                            </div>
                            <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] italic">Sin movimientos detectados</p>
                        </div>
                    ) : (
                        data?.history?.map((h: any) => (
                            <div key={h.id} className="p-10 hover:bg-stone-50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                                        h.type === 'reward' 
                                        ? 'bg-gray-400/10 text-gray-400 border-gray-400/20 group-hover:bg-gray-400 group-hover:text-white group-hover:shadow-lg group-hover:shadow-gray-400/20' 
                                        : 'bg-black text-white border-black group-hover:bg-black/90'
                                    }`}>
                                        {h.type === 'reward' ? <ArrowDownLeft size={24} strokeWidth={1.5} /> : <ArrowUpRight size={24} strokeWidth={1.5} />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-black uppercase tracking-tight italic">{h.description}</p>
                                        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                            <span>{new Date(h.created_at).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-stone-100 rounded-full" />
                                            <span className="text-gray-400 opacity-60">{h.type === 'reward' ? 'CRÉDITO_NODO' : 'DÉBITO_NODO'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-3xl font-black tracking-tighter tabular-nums ${h.type === 'reward' ? 'text-gray-400' : 'text-black'}`} suppressHydrationWarning>
                                    {h.type === 'reward' ? '+' : '-'}{formatCurrency(Math.abs(h.amount))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

          {/* Sidebar Area: Referral Card */}
          <div className="space-y-16">
            <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-black/5 border border-stone-100 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 text-black/[0.02] -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-1000">
                    <Gift size={240} />
                </div>
                
                <div className="relative space-y-10">
                    <div className="w-20 h-20 rounded-2xl bg-gray-400 text-white flex items-center justify-center shadow-xl shadow-gray-400/20">
                        <Gift size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-4xl font-black font-serif text-black tracking-tighter uppercase leading-[0.85]">
                      Invita <span className="text-gray-400 italic">Nodos</span><br/>
                      <span className="text-2xl mt-4 block text-slate-400 font-sans tracking-tight">Recibe +$500 en recompensas</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-relaxed">
                        Expanda la red BANDHA. Por cada nuevo nodo que realice una transacción exitosa, se activará un crédito de recompensas en su billetera.
                    </p>

                    <div className="space-y-5 pt-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] px-1">Protocolo de Compartición</label>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-5 text-[10px] font-bold text-slate-400 truncate flex items-center shadow-inner">
                                {`REF_ID: ${data?.referral_code || "UNKNOWN"}`}
                            </div>
                            <button 
                                onClick={handleCopyLink}
                                className={`w-16 h-16 rounded-2xl border transition-all flex items-center justify-center shadow-xl ${
                                    copying 
                                    ? 'bg-gray-400 text-white border-gray-400 shadow-gray-400/20' 
                                    : 'bg-black text-white border-black hover:bg-black/90 shadow-black/20'
                                }`}
                            >
                                {copying ? <CheckCircle2 size={24} strokeWidth={1.5} /> : <Copy size={24} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-10 space-y-6">
                         <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-3 italic">
                             <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" /> Guía de Operación
                         </h4>
                         <ul className="space-y-5">
                             {[
                                 { text: "Distribuya su código único de enlace." },
                                 { text: "Los nodos invitados deben realizar una compra." },
                                 { text: "Acreditación automática en su Core_Wallet." }
                             ].map((step, i) => (
                                 <li key={i} className="flex gap-5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                     <span className="text-gray-400 font-serif italic text-lg opacity-40 leading-none">{i + 1}</span>
                                     <span className="pt-1">{step.text}</span>
                                 </li>
                             ))}
                         </ul>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="p-10 rounded-[2rem] bg-black text-white shadow-2xl shadow-black/20 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gray-400" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Optimización de Red</h4>
                 <p className="text-sm font-black font-serif italic tracking-tight leading-snug opacity-90 group-hover:opacity-100 transition-opacity">
                    "Las recompensas acumuladas son ilimitadas. La utilización de créditos en transacciones grupales optimiza su flujo de activos hasta un 100%."
                 </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}
