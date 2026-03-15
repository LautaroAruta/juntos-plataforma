"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Shield, 
  ArrowLeft, 
  Search, 
  Filter, 
  Activity, 
  User, 
  Database, 
  Clock,
  Loader2,
  ChevronDown,
  Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users (nombre, email, avatar_url)
      `)
      .order('creado_en', { ascending: false })
      .limit(50);

    if (filterAction !== "all") {
      query = query.eq('accion', filterAction);
    }

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  }, [supabase, filterAction]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.rol !== "admin") {
      router.push("/dashboard");
    } else {
      fetchLogs();
    }
  }, [session, status, router, fetchLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('LIQUIDACION')) return 'bg-green-50 text-green-600 border-green-100';
    if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Auditoria <span className="text-[#009EE3]">Sistema</span></h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-1">Registro de actividad administrativa</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por ID o Usuario..."
                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#009EE3]/10 outline-none w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <select 
             value={filterAction}
             onChange={(e) => setFilterAction(e.target.value)}
             className="bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer pr-10 relative"
           >
              <option value="all">Todas las Acciones</option>
              <option value="LIQUIDACION_PROVEEDOR">Liquidaciones</option>
              <option value="PROD_DELETE">Bajas Productos</option>
              <option value="ROLE_CHANGE">Cambios de Rol</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Actor / Usuario</th>
                <th className="px-8 py-5">Acción</th>
                <th className="px-8 py-5">Entidad / ID</th>
                <th className="px-8 py-5 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.filter(log => 
                log.accion.toLowerCase().includes(searchQuery.toLowerCase()) || 
                log.user?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold">
                        {new Date(log.creado_en).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                         {log.user?.avatar_url ? <img src={log.user.avatar_url} alt="" /> : <User size={16} className="m-auto text-slate-300" />}
                      </div>
                      <div>
                        <div className="font-black text-slate-700 text-xs uppercase">{log.user?.nombre || 'Auth System'}</div>
                        <div className="text-[9px] text-slate-400">{log.user?.email || 'system@bandha.co'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getActionColor(log.accion)}`}>
                      {log.accion.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Database size={14} className="text-slate-300" />
                       <span className="text-[10px] font-mono text-slate-400">
                          {log.tabla}: {log.registro_id?.split('-')[0] || 'N/A'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-[#009EE3] transition-colors">
                      <Info size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center">
                      <Activity size={48} className="mx-auto text-slate-100 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-300">No hay registros de auditoría</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
