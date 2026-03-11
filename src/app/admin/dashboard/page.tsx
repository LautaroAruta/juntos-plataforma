"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  Settings, 
  TrendingUp, 
  Check, 
  X, 
  Clock,
  ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [providers, setProviders] = useState<any[]>([]);
  const [commission, setCommission] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('providers').select('*').order('creado_en', { ascending: false });
      setProviders(data || []);
      
      const { data: config } = await supabase.from('commission_config').select('porcentaje').eq('activo', true).single();
      if (config) setCommission(config.porcentaje);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const approveProvider = async (id: string) => {
    const { error } = await supabase.from('providers').update({ verificado: true }).eq('id', id);
    if (!error) {
      setProviders(providers.map(p => p.id === id ? { ...p, verificado: true } : p));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Comandancia Admin</h1>
          <p className="text-slate-500">Gestión global de la plataforma JUNTOS</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <TrendingUp className="text-green-500" size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400">Comisión Base</span>
              <span className="text-lg font-black text-slate-800">{commission}%</span>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Providers */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <Users className="text-[#0077CC]" size={20} /> Proveedores Pendientes
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {providers.filter(p => !p.verificado).map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group hover:border-[#0077CC]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                      <span className="text-lg">🏪</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{provider.nombre_empresa}</h4>
                      <p className="text-slate-400 text-xs">{provider.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => approveProvider(provider.id)}
                      className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Check size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-50 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {providers.filter(p => !p.verificado).length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm italic">No hay proveedores pendientes.</div>
              )}
            </div>
          </div>
        </div>

        {/* Global Activity / Logs */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50">
               <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                 <ShieldCheck className="text-[#00AEEF]" size={20} /> Actividad del Sistema
               </h2>
             </div>
             <div className="p-6 space-y-6">
                {[
                  { text: 'Nuevo producto cargado: Auriculares Pro', time: 'hace 5 min', icon: '📦' },
                  { text: 'Pago recibido: Order #4829', time: 'hace 12 min', icon: '💰' },
                  { text: 'Nuevo usuario registrado: aruta39@gmail.com', time: 'hace 1 h', icon: '👤' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <span className="text-xl">{log.icon}</span>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-slate-700">{log.text}</p>
                       <span className="text-[10px] font-black uppercase text-slate-300 flex items-center gap-1 mt-1">
                         <Clock size={10} /> {log.time}
                       </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
