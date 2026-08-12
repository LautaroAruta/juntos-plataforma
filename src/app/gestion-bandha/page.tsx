"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  PieChart as PieChartIcon,
  Download,
  Calendar,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Package,
  Search
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GestionBandhaPage() {
  const [stats, setStats] = useState({
    totalGmv: 0,
    totalComm: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalWalletLiability: 0,
    totalRewardsDisbursed: 0,
    referralConversionRate: 0,
    totalReferrals: 0
  });
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeDeals, setActiveDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch payments with order and provider info
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders (
            id,
            creado_en,
            estado,
            arrepentimiento_solicitado,
            provider:providers (
              nombre_empresa
            ),
            group_deal:group_deals (
              product:products (nombre)
            )
          )
        `)
        .order('creado_en', { ascending: false });

      if (!payError && payData) {
        setPayments(payData);
        
        // Calculate totals
        const gmv = payData.reduce((acc, p) => acc + Number(p.monto_total), 0);
        const comm = payData.reduce((acc, p) => acc + Number(p.monto_comision), 0);
        
        setStats(prev => ({
          ...prev,
          totalGmv: gmv,
          totalComm: comm,
          totalOrders: payData.length,
          avgOrderValue: payData.length > 0 ? gmv / payData.length : 0
        }));
      }

      // 2. Fetch active deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('group_deals')
        .select(`
          *,
          product:products (nombre)
        `)
        .eq('estado', 'activo')
        .order('creado_en', { ascending: false });

      // 3. Fetch Wallet Stats
      const { data: walletData } = await supabase
        .from('wallet_history')
        .select('amount, type');
      
      const rewards = walletData?.filter(w => w.type === 'reward').reduce((acc, w) => acc + Number(w.amount), 0) || 0;
      const usage = walletData?.filter(w => w.type === 'usage').reduce((acc, w) => acc + Number(w.amount), 0) || 0;
      const liability = (rewards + usage); // positive rewards + negative usage = current active balance in circulation

      setStats(prev => ({
        ...prev,
        totalWalletLiability: liability,
        totalRewardsDisbursed: rewards
      }));

      // 5. Fetch Referral Stats
      const { data: refData } = await supabase
        .from('referrals')
        .select('status');
      
      if (refData) {
        const totalRefs = refData.length;
        const completedRefs = refData.filter(r => r.status === 'completed').length;
        const conversion = totalRefs > 0 ? (completedRefs / totalRefs) * 100 : 0;
        
        setStats(prev => ({
          ...prev,
          totalReferrals: totalRefs,
          referralConversionRate: conversion
        }));
      }

      // 4. Fetch recent wallet history
      const { data: historyData } = await supabase
        .from('wallet_history')
        .select('*, user:users(nombre, apellido, email)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (historyData) setWalletHistory(historyData);

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={48} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">SYSTEM_INITIALIZING</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] pb-32 pt-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-100 pb-16 relative">
          <div className="absolute -top-12 left-0 text-[10px] font-black text-brand-camel uppercase tracking-[0.6em] opacity-40">
            SYSTEM_ADMIN_NODE
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-charcoal text-white p-3 rounded-full">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Governance Protocol 2.1</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-serif text-brand-charcoal tracking-tighter leading-[0.8]">
              Gestión <span className="text-brand-camel italic">Bandha</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-6">
              Métricas de Plataforma <span className="w-12 h-[1px] bg-stone-200" /> Monitoreo en Tiempo Real
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className="h-16 px-10 border border-stone-200 font-black text-[10px] uppercase tracking-widest text-brand-charcoal bg-white hover:bg-stone-50 transition-all rounded-2xl flex items-center gap-3">
              <Download size={18} /> Exportar Registros
            </button>
            <Link href="/" className="btn-boutique h-16 px-10 rounded-2xl flex items-center gap-3">
              Ver Tienda <ArrowUpRight size={18} />
            </Link>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <StatCard 
            label="Balance en Circulación" 
            value={formatCurrency(stats.totalWalletLiability)} 
            icon={<DollarSign size={24} strokeWidth={1.5} />} 
            trend="Wallet Liability"
            color="text-brand-camel"
          />
          <StatCard 
            label="Recompensas Otorgadas" 
            value={formatCurrency(stats.totalRewardsDisbursed)} 
            icon={<Package size={24} strokeWidth={1.5} />} 
            trend="Acquisition Cost"
            color="text-brand-camel"
          />
          <StatCard 
            label="Ingresos por Comisión" 
            value={formatCurrency(stats.totalComm)} 
            icon={<TrendingUp size={24} strokeWidth={1.5} />} 
            trend="Net Protocol Fee"
            highlight
            color="text-brand-camel"
          />
          <StatCard 
            label="Ratio de Conversión" 
            value={`${stats.referralConversionRate.toFixed(1)}%`} 
            icon={<Users size={24} strokeWidth={1.5} />} 
            trend={`${stats.totalReferrals} Referrals`}
            color="text-brand-camel"
          />
        </div>

        {/* ADMIN TOOLS & SEARCH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
            <div className="lg:col-span-1 bg-white boutique-card p-12 relative overflow-hidden shadow-xl shadow-brand-charcoal/5">
               <div className="absolute top-0 right-0 p-6 opacity-30">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Protocol Adjust</span>
               </div>
               <h3 className="text-xl font-black font-serif text-brand-charcoal tracking-tight mb-10 flex items-center gap-3">
                 Calibración de <span className="text-brand-camel italic">Wallet</span>
               </h3>
               
               <div className="space-y-8">
                  <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Buscar destinatario..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 focus:bg-white focus:border-brand-camel py-5 px-6 text-sm transition-all outline-none font-medium rounded-2xl placeholder:text-slate-300"
                     />
                     <button 
                        onClick={async () => {
                           if (searchTerm.length < 3) return;
                           const { data } = await supabase
                            .from('users')
                            .select('*')
                            .or(`email.ilike.%${searchTerm}%,nombre.ilike.%${searchTerm}%`)
                            .limit(5);
                           setSearchResults(data || []);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-camel transition-colors p-2"
                     >
                        <Search size={20} strokeWidth={1.5} />
                     </button>
                  </div>

                  {searchResults.length > 0 && (
                     <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar py-6 border-t border-stone-50">
                        {searchResults.map(u => (
                           <button 
                              key={u.id}
                              onClick={() => setSelectedUser(u)}
                              className={`w-full text-left p-6 rounded-2xl border transition-all group ${selectedUser?.id === u.id ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-lg' : 'bg-white text-brand-charcoal border-stone-100 hover:border-brand-camel hover:bg-stone-50'}`}
                           >
                              <p className="font-black font-serif text-sm tracking-tight">{u.nombre} {u.apellido}</p>
                              <p className="text-[10px] opacity-40 font-mono tracking-widest">{u.email}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedUser?.id === u.id ? 'text-white/40' : 'text-slate-300'}`}>Balance actual</span>
                                <p className={`text-xs font-black ${selectedUser?.id === u.id ? 'text-brand-camel' : 'text-brand-camel'}`}>{formatCurrency(u.wallet_balance || 0)}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                  )}

                  {selectedUser && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 pt-10 border-t border-stone-50 mt-10"
                     >
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Magnitud del Ajuste (+/-)</label>
                           <input 
                              type="number"
                              placeholder="0.00"
                              value={adjustmentAmount}
                              onChange={(e) => setAdjustmentAmount(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 px-6 text-2xl outline-none font-black text-brand-charcoal focus:ring-1 focus:ring-brand-camel focus:border-brand-camel transition-all"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Referencia o Motivo</label>
                           <input 
                              type="text" 
                              placeholder="Ej: Corrección de sistema" 
                              value={adjustmentReason}
                              onChange={(e) => setAdjustmentReason(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-5 px-6 text-sm outline-none font-medium placeholder:text-slate-300"
                           />
                        </div>
                        <button 
                           onClick={async () => {
                              if (!adjustmentAmount || !adjustmentReason) return;
                              setIsAdjusting(true);
                              const res = await fetch("/api/admin/wallet/adjust", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({
                                    userId: selectedUser.id,
                                    amount: adjustmentAmount,
                                    reason: adjustmentReason
                                 })
                              });
                              if (res.ok) {
                                 setSelectedUser(null);
                                 setAdjustmentAmount("");
                                 setAdjustmentReason("");
                                 setSearchTerm("");
                                 setSearchResults([]);
                                 window.location.reload();
                              }
                              setIsAdjusting(false);
                           }}
                           disabled={isAdjusting}
                           className="w-full btn-boutique h-18 rounded-2xl flex items-center justify-center text-xs tracking-[0.2em] group shadow-xl shadow-brand-camel/10"
                        >
                           {isAdjusting ? "Procesando..." : "Ejecutar Ajuste"}
                        </button>
                     </motion.div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-2 bg-white boutique-card shadow-xl shadow-brand-charcoal/5 overflow-hidden flex flex-col h-full border border-stone-100">
               <div className="p-10 border-b border-stone-50 flex items-center justify-between">
                 <h3 className="text-xl font-black font-serif text-brand-charcoal tracking-tight flex items-center gap-4">
                   <ArrowUpRight size={24} className="text-brand-camel" /> Historial de Movimientos
                 </h3>
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Sincronizado</span>
               </div>
               <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-stone-50">
                           <th className="px-10 py-8">Destinatario</th>
                           <th className="px-10 py-8">Tipo</th>
                           <th className="px-10 py-8 text-center">Valor</th>
                           <th className="px-10 py-8 text-right">Fecha</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-stone-50">
                        {walletHistory.length === 0 ? (
                           <tr><td colSpan={4} className="py-24 text-center text-[10px] text-slate-200 font-black uppercase tracking-[0.6em]">No hay actividad reciente</td></tr>
                        ) : walletHistory.map(h => (
                           <tr key={h.id} className="text-sm group hover:bg-stone-50/50 transition-colors">
                              <td className="px-10 py-8 whitespace-nowrap">
                                 <p className="font-black font-serif text-brand-charcoal tracking-tight">{h.user?.nombre} {h.user?.apellido}</p>
                                 <p className="text-[10px] text-slate-400 font-medium lowercase tracking-tight">{h.user?.email}</p>
                              </td>
                              <td className="px-10 py-8">
                                <span className="px-4 py-1.5 bg-brand-charcoal text-white font-black text-[9px] uppercase tracking-widest italic rounded-full shadow-sm shadow-brand-charcoal/10">{h.type}</span>
                              </td>
                              <td className={`px-10 py-8 font-black text-base text-center tabular-nums ${Number(h.amount) > 0 ? 'text-brand-camel' : 'text-slate-400'}`}>
                                 {Number(h.amount) > 0 ? '+' : ''}{formatCurrency(h.amount)}
                              </td>
                              <td className="px-10 py-8 text-slate-400 text-[10px] text-right font-bold uppercase tracking-widest">{new Date(h.created_at).toLocaleDateString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* PAYMENTS TABLE */}
          <div className="lg:col-span-2 bg-white boutique-card shadow-xl shadow-brand-charcoal/5 overflow-hidden border border-stone-100 flex flex-col">
            <div className="p-12 border-b border-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <h3 className="text-3xl font-black font-serif text-brand-charcoal tracking-tight italic leading-none">Flujo de Transacciones</h3>
              <div className="flex items-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-widest border border-stone-100 px-5 py-2.5 rounded-full bg-stone-50/50">
                <Calendar size={14} /> Ciclo de 30 Días
              </div>
            </div>
            
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50/50 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-stone-100">
                    <th className="px-12 py-8">ID // Fecha</th>
                    <th className="px-12 py-8">Vendedor // Producto</th>
                    <th className="px-12 py-8 text-center">Monto Bruto</th>
                    <th className="px-12 py-8 text-right">Comisión (0.5%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-12 py-40 text-center text-slate-200 font-black uppercase tracking-[1em] italic select-none">
                        Sin datos en el flujo
                      </td>
                    </tr>
                  ) : payments.map((p) => {
                    const isRefunded = p.order?.arrepentimiento_solicitado;
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-12 py-10">
                          <div className="space-y-1">
                            <span className="block text-xs font-bold text-slate-500">{new Date(p.order?.creado_en || p.creado_en).toLocaleDateString()}</span>
                            <span className="block text-[10px] font-black text-slate-300 font-mono tracking-widest uppercase">#{p.id.slice(0, 10)}</span>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="block text-sm font-black font-serif text-brand-charcoal tracking-tight italic">
                                    {p.order?.provider?.nombre_empresa || "Proveedor Desconocido"}
                                </span>
                                {isRefunded && (
                                    <span className="text-[9px] font-black bg-stone-100 text-slate-400 px-3 py-1 uppercase tracking-tighter italic rounded-full">
                                        REEMBOLSO
                                    </span>
                                )}
                            </div>
                            <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate max-w-[200px]">
                              {p.order?.group_deal?.product?.nombre || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-12 py-10 text-center">
                          <span className={`text-base font-black tabular-nums ${isRefunded ? 'text-slate-200 line-through' : 'text-slate-500'}`}>
                            {formatCurrency(p.monto_total)}
                          </span>
                        </td>
                        <td className="px-12 py-10 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-base font-black tabular-nums ${isRefunded ? 'text-slate-200 line-through' : 'text-brand-camel'}`}>
                                {formatCurrency(p.monto_comision)}
                            </span>
                            {!isRefunded && <span className="text-[8px] font-black bg-brand-charcoal text-white px-2 py-0.5 tracking-widest rounded-sm">ACTIVO</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <button className="w-full py-10 bg-brand-charcoal text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-brand-charcoal/90 transition-all italic border-t border-brand-charcoal">
              Descargar Libro de Contabilidad Completo
            </button>
          </div>

          {/* SIDEBAR: ACTIVE DEALS */}
          <div className="space-y-12">
            <div className="bg-white boutique-card p-12 shadow-xl shadow-brand-charcoal/5 relative overflow-hidden border border-stone-100">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Package size={80} strokeWidth={1} />
               </div>
               <h3 className="text-xl font-black font-serif text-brand-charcoal tracking-tight mb-12 flex items-center gap-4">
                 <div className="w-1 h-8 bg-brand-camel" /> Lotes en <span className="text-brand-camel italic">Curso</span>
               </h3>
               
               <div className="space-y-12">
                   {activeDeals.length === 0 ? (
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] italic">No hay lotes activos</p>
                   ) : activeDeals.map((deal) => (
                      <DealStatusItem 
                        key={deal.id}
                        title={deal.product?.nombre || "Activo sin nombre"} 
                        progress={(deal.participantes_actuales / deal.min_participantes) * 100} 
                        participants={`${deal.participantes_actuales}/${deal.min_participantes}`} 
                        completed={deal.participantes_actuales >= deal.min_participantes} 
                      />
                   ))}
                </div>

               <Link href="/productos" className="mt-16 w-full flex items-center justify-center gap-4 py-8 border border-dashed border-stone-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:border-brand-camel hover:text-brand-charcoal transition-all group italic bg-stone-50/20">
                  Explorar Catálogo <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="bg-brand-charcoal boutique-card p-12 shadow-xl shadow-brand-charcoal/20 text-white relative group overflow-hidden border border-white/5">
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                 <ArrowUpRight size={240} strokeWidth={1} />
               </div>
               <ArrowUpRight size={48} strokeWidth={1} className="mb-10 text-brand-camel" />
               <h4 className="text-3xl font-black font-serif uppercase tracking-tighter leading-none mb-6">Programa de <span className="text-brand-camel italic lowercase">Liquidez</span></h4>
               <p className="text-white/40 text-[10px] font-bold uppercase leading-relaxed mb-10 tracking-[0.2em]">
                 Optimice sus márgenes activando bucles de comunidad. Monitoreo predictivo de expiración de nodos.
               </p>
               <button className="w-full h-16 bg-white text-brand-charcoal font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-brand-stone transition-all shadow-lg active:scale-95 italic border border-white/10">
                 Generar Reporte de Rendimiento
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, color, highlight }: any) {
  return (
    <div className={`bg-white boutique-card p-10 shadow-xl shadow-brand-charcoal/5 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden border border-stone-100`}>
      <div className="flex justify-between items-start mb-10">
        <div className={`w-14 h-14 rounded-full border border-stone-100 bg-stone-50/50 flex items-center justify-center shadow-inner ${color} transition-transform duration-700 group-hover:rotate-12`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] font-mono">{trend}</span>
          <div className="w-8 h-[1px] bg-stone-100 mt-3" />
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">{label}</h4>
        <p className={`text-4xl md:text-5xl font-black font-serif tracking-tighter tabular-nums leading-none ${highlight ? 'text-brand-camel' : 'text-brand-charcoal'}`}>{value}</p>
      </div>
    </div>
  );
}

function DealStatusItem({ title, progress, participants, completed }: any) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black font-serif text-brand-charcoal uppercase tracking-widest max-w-[200px] leading-tight italic">{title}</span>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Capacidad</span>
          <span className={`text-lg font-black tabular-nums italic ${completed ? 'text-brand-camel' : 'text-brand-charcoal'}`}>
            {participants}
          </span>
        </div>
      </div>
      <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-1000 ${completed ? 'bg-brand-camel' : 'bg-brand-charcoal'}`}
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-black text-white mix-blend-difference tracking-[0.5em]">{Math.round(progress)}%_STAGED</span>
        </div>
      </div>
    </div>
  );
}
