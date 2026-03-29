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
  Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GestionBandhaPage() {
  const [stats, setStats] = useState({
    totalGmv: 0,
    totalComm: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch payments with order and provider info
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders (
            id,
            creado_en,
            provider:providers (
              nombre_empresa
            ),
            group_deal:group_deals (
              product:products (nombre)
            )
          )
        `)
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setPayments(data);
        
        // Calculate totals
        const gmv = data.reduce((acc, p) => acc + Number(p.monto_total), 0);
        const comm = data.reduce((acc, p) => acc + Number(p.monto_comision), 0);
        
        setStats({
          totalGmv: gmv,
          totalComm: comm,
          totalOrders: data.length,
          avgOrderValue: data.length > 0 ? gmv / data.length : 0
        });
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-bandha-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] flex items-center gap-3">
              <ShieldCheck className="text-[#009EE3]" size={40} /> Gestión BANDHA
            </h1>
            <p className="text-slate-500 font-bold ml-1 uppercase text-xs tracking-widest flex items-center gap-2">
              Panel de Control de la Plataforma <span className="w-1 h-1 rounded-full bg-slate-300" /> Stats en Tiempo Real
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={16} /> Exportar Reporte
            </button>
            <Link href="/" className="bg-[#009EE3] px-6 py-3 rounded-2xl shadow-xl shadow-[#009EE3]/20 text-xs font-black uppercase tracking-widest text-white hover:bg-[#0077CC] transition-all active:scale-95">
              Ir a la Tienda
            </Link>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Comisión Total (0.5%)" 
            value={formatCurrency(stats.totalComm)} 
            icon={<TrendingUp className="text-bandha-primary" />} 
            trend="+12.5% este mes"
            color="bg-green-50"
          />
          <StatCard 
            label="Volumen Transaccionado" 
            value={formatCurrency(stats.totalGmv)} 
            icon={<DollarSign className="text-[#009EE3]" />} 
            trend="Total GMV"
            color="bg-sky-50"
          />
          <StatCard 
            label="Pedidos Procesados" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingBag className="text-amber-500" />} 
            trend="Exitosos"
            color="bg-amber-50"
          />
          <StatCard 
            label="Ticket Promedio" 
            value={formatCurrency(stats.avgOrderValue)} 
            icon={<PieChartIcon className="text-purple-500" />} 
            trend="Por pedido"
            color="bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PAYMENTS TABLE */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Transacciones Recientes</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                <Calendar size={12} /> Últimos 30 días
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Fecha / ID</th>
                    <th className="px-8 py-5">Proveedor / Producto</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5 text-[#009EE3]">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                        No se detectaron transacciones todavía.
                      </td>
                    </tr>
                  ) : payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <span className="block text-xs font-black text-slate-800">{new Date(p.order?.creado_en || p.creado_en).toLocaleDateString()}</span>
                          <span className="block text-[10px] font-bold text-slate-400">#{p.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <span className="block text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                            {p.order?.provider?.nombre_empresa || "Proveedor Desconocido"}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-400 line-clamp-1">
                            {p.order?.group_deal?.product?.nombre || "Producto"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-800">{formatCurrency(p.monto_total)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#009EE3]">{formatCurrency(p.monto_comision)}</span>
                          <span className="text-[10px] font-black bg-sky-50 text-[#009EE3] px-2 py-0.5 rounded-md">0.5%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button className="w-full py-5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 hover:bg-slate-100 transition-colors">
              Ver todas las transacciones
            </button>
          </div>

          {/* SIDEBAR: ACTIVE DEALS */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Package size={16} className="text-[#009EE3]" /> Ofertas en Proceso
               </h3>
               
               <div className="space-y-6">
                  {/* Mock data or fetch later */}
                  <DealStatusItem title="Yerba Mate Orgánica" progress={85} participants="17/20" />
                  <DealStatusItem title="Aceite de Oliva Extra" progress={40} participants="8/20" />
                  <DealStatusItem title="Miel Pura de Monte" progress={100} participants="15/15" completed />
               </div>

               <Link href="/productos" className="mt-8 w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#009EE3]/20 hover:text-[#009EE3] transition-all">
                  Ver todas las ofertas <ChevronRight size={12} />
               </Link>
            </div>

            <div className="bg-gradient-to-br from-bandha-primary to-bandha-secondary rounded-[2.5rem] p-8 text-white shadow-xl shadow-bandha-primary/20">
               <ArrowUpRight size={32} className="mb-4 opacity-50" />
               <h4 className="text-xl font-black uppercase tracking-tight leading-tight mb-2">Potenciá tus Ingresos</h4>
               <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                 Cuantos más grupos se completen, más comisiones recaudás. Revisá los deals que están por vencer y compartilos.
               </p>
               <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                 Ver Reporte Detallado
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

function DealStatusItem({ title, progress, participants, completed }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-slate-700 truncate max-w-[150px]">{title}</span>
        <span className={`text-[10px] font-black ${completed ? 'text-[#00A650]' : 'text-slate-400'}`}>
          {participants}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${completed ? 'bg-[#00A650]' : 'bg-[#009EE3]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
