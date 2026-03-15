"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  UserCheck, 
  Store, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Shield,
  Filter,
  BarChart3,
  Search,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    activeUsers: 0,
    activeProviders: 0,
    totalOrders: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch Stats
    const { data: payments } = await supabase
      .from('payments')
      .select('monto_total, monto_comision');
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: providerCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true });

    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const totalRev = payments?.reduce((acc, p) => acc + Number(p.monto_total), 0) || 0;
    const totalCom = payments?.reduce((acc, p) => acc + Number(p.monto_comision), 0) || 0;

    setStats({
      totalRevenue: totalRev,
      totalCommissions: totalCom,
      activeUsers: userCount || 0,
      activeProviders: providerCount || 0,
      totalOrders: orderCount || 0
    });

    // 2. Fetch Recent Payments with Orders and Users
    const { data: recent } = await supabase
      .from('payments')
      .select(`
        id,
        monto_total,
        monto_comision,
        creado_en,
        order:orders (
          id,
          user:users (nombre, email)
        )
      `)
      .order('creado_en', { ascending: false })
      .limit(8);

    setRecentPayments(recent || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.rol !== "admin") {
      toast.error("Acceso denegado. Se requieren permisos de administrador.");
      router.push("/dashboard");
    } else {
      fetchAdminData();
    }
  }, [session, status, router, fetchAdminData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 rounded-lg bg-[#009EE3] flex items-center justify-center text-white">
                <BarChart3 size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plataforma JUNTOS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Master <span className="text-[#009EE3]">Admin</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Supervisión global de la red colaborativa</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <button 
             onClick={() => setTimeRange('7d')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === '7d' ? 'bg-[#009EE3] text-white' : 'text-slate-400 hover:text-slate-600'}`}
           >
             7 Días
           </button>
           <button 
             onClick={() => setTimeRange('30d')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === '30d' ? 'bg-[#009EE3] text-white' : 'text-slate-400 hover:text-slate-600'}`}
           >
             30 Días
           </button>
           <div className="w-px h-6 bg-slate-100 mx-1" />
           <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
              <Calendar size={18} />
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          title="Facturación Total" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          trendUp={true} 
          icon={<DollarSign className="text-[#00A650]" />}
          color="green"
        />
        <AdminStatCard 
          title="Comisiones Bandha" 
          value={`$${stats.totalCommissions.toLocaleString()}`} 
          trend="+8.3%" 
          trendUp={true} 
          icon={<TrendingUp className="text-[#009EE3]" />}
          color="blue"
        />
        <AdminStatCard 
          title="Usuarios Activos" 
          value={stats.activeUsers.toString()} 
          trend="+42" 
          trendUp={true} 
          icon={<Users className="text-purple-500" />}
          color="purple"
        />
        <AdminStatCard 
          title="Proveedores" 
          value={stats.activeProviders.toString()} 
          trend="-2" 
          trendUp={false} 
          icon={<Store className="text-orange-500" />}
          color="orange"
        />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Activity List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Transacciones Recientes</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoreo de pagos en tiempo real</p>
              </div>
              <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
                <Search size={20} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                    <th className="px-8 py-5">Referencia / Fecha</th>
                    <th className="px-8 py-5">Cliente</th>
                    <th className="px-8 py-5">Monto Total</th>
                    <th className="px-8 py-5">Comisión</th>
                    <th className="px-8 py-5 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-700 text-xs">#{payment.id.split('-')[0]}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase mt-1">
                          {new Date(payment.creado_en).toLocaleString('es-AR')}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-800 text-xs uppercase">{payment.order?.user?.nombre || 'S/D'}</div>
                        <div className="text-[10px] text-slate-400">{payment.order?.user?.email}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-slate-800 text-sm">${payment.monto_total.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2 py-1 bg-blue-50 text-[#009EE3] rounded-lg text-[10px] font-black">
                          +${payment.monto_comision.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-[#009EE3] transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 uppercase font-black tracking-widest">
                        Sin transacciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
              <button className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest hover:underline transition-all">
                Ver todas las transacciones
              </button>
            </div>
          </div>
        </div>

        {/* Right: Mini Stats & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-[#1E293B] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Salud de la Red</h3>
                <div className="space-y-6">
                   <MiniHealthStat label="Ordenes Completadas" value="98.2%" color="bg-[#00A650]" />
                   <MiniHealthStat label="Uptime de Servidores" value="99.9%" color="bg-[#009EE3]" />
                   <MiniHealthStat label="Soporte Pendiente" value="4 Tickets" color="bg-orange-500" />
                </div>
             </div>
             {/* Decorative pattern */}
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center justify-between">
                Accesos <MoreHorizontal className="text-slate-300" />
             </h3>
             <div className="grid grid-cols-1 gap-3">
                <QuickLink label="Liquidaciones y Pagos" href="/dashboard/admin/payouts" icon={<DollarSign size={18} />} />
                <QuickLink label="Ver todos los Productos" href="/shop" icon={<ShoppingBag size={18} />} />
                <QuickLink label="Gestionar Proveedores" href="#" icon={<Store size={18} />} />
                <QuickLink label="Auditoría del Sistema" href="/dashboard/admin/audit" icon={<Shield size={18} />} />
                <QuickLink label="Configuración Global" href="#" icon={<Filter size={18} />} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, trend, trendUp, icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 group-hover:bg-[#009EE3]/10",
    green: "bg-green-50 group-hover:bg-green-100",
    purple: "bg-purple-50 group-hover:bg-purple-100",
    orange: "bg-orange-50 group-hover:bg-orange-100"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:border-[#009EE3]/20 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl ${colorMap[color]} flex items-center justify-center text-2xl transition-all duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black ${trendUp ? 'text-green-500' : 'text-red-500'} bg-slate-50 px-2 py-1 rounded-lg`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-[#009EE3] transition-colors">{value}</p>
      </div>
    </motion.div>
  );
}

function MiniHealthStat({ label, value, color }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "100%" }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className={`h-full ${color}`} 
         />
      </div>
    </div>
  );
}

function QuickLink({ label, href, icon }: any) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-[#009EE3] hover:text-white rounded-2xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-white transition-colors">{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={16} />
      </div>
    </Link>
  );
}
