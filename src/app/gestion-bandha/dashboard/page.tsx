"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Search,
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Check,
  X,
  Clock,
  ExternalLink,
  ChevronUp,
  Download,
  Calendar,
  Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<any[]>([]);
  const [stats, setStats] = useState({ gmv: 0, savings: 0, users: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [commission, setCommission] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (status === "loading") return;

    // Strict security check: only aruta839@gmail.com
    if (!session || session.user?.email !== "aruta839@gmail.com") {
      router.replace("/");
      return;
    }

    async function fetchData() {
      // 1. Fetch Providers
      const { data: pData } = await supabase.from('providers').select('*').order('creado_en', { ascending: false });
      setProviders(pData || []);
      
      // 2. Fetch Stats
      const { data: pments } = await supabase.from('payments').select('monto_total').eq('estado', 'approved');
      const gmv = pments?.reduce((acc, p) => acc + Number(p.monto_total), 0) || 0;
      
      const { data: uData } = await supabase.from('users').select('total_saved');
      const savings = uData?.reduce((acc, u) => acc + Number(u.total_saved), 0) || 0;
      const userCount = uData?.length || 0;
      
      setStats({ gmv, savings, users: userCount });

      // 3. Fetch Activity (Latest 5 payments with user names)
      const { data: actData } = await supabase
        .from('payments')
        .select(`
          creado_en,
          monto_total,
          orders (
            users (nombre, apellido)
          )
        `)
        .order('creado_en', { ascending: false })
        .limit(5);
      setActivity(actData || []);
      
      const { data: config } = await supabase.from('commission_config').select('porcentaje').eq('activo', true).single();
      if (config) setCommission(config.porcentaje);
      
      setLoading(false);
    }
    fetchData();
  }, [session, status, router]);

  if (status === "loading" || !session || session.user?.email !== "aruta839@gmail.com") {
    return null;
  }

  const approveProvider = async (id: string) => {
    const { error } = await supabase.from('providers').update({ verificado: true }).eq('id', id);
    if (!error) {
      setProviders(providers.map(p => p.id === id ? { ...p, verificado: true } : p));
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA] pb-32 pt-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-100 pb-16 relative">
          <div className="absolute -top-12 left-0 text-[10px] font-black text-brand-camel uppercase tracking-[0.6em] opacity-40">
            ADMIN_PIPELINE_NODE
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-charcoal text-white p-3 rounded-full">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Verificación de Protocolo</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-serif text-brand-charcoal tracking-tighter leading-[0.8]">
              Comandancia <span className="text-brand-camel italic">Admin</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-6">
              Pipeline de Proveedores <span className="w-12 h-[1px] bg-stone-200" /> Gobernanza Global
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBlock label="Usuarios Totales" value={stats.users} />
            <StatBlock label="Liquidez GMV" value={stats.gmv.toLocaleString()} isCurrency />
            <StatBlock label="Ahorro Social" value={stats.savings.toLocaleString()} isCurrency />
            <StatBlock label="Tasa Protocolo" value={`${commission}%`} highlight />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pending Providers */}
          <div className="bg-white boutique-card p-4 shadow-xl shadow-brand-charcoal/5 relative overflow-hidden flex flex-col border border-stone-100">
            <div className="p-10 border-b border-stone-50 flex items-center justify-between">
              <h2 className="text-2xl font-black font-serif text-brand-charcoal tracking-tight italic flex items-center gap-4">
                <Users className="text-brand-camel" size={24} strokeWidth={1.5} /> Verificaciones Pendientes
              </h2>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cola: {providers.filter(p => !p.verificado).length}</span>
            </div>
            
            <div className="p-10 space-y-8 flex-grow">
              {providers.filter(p => !p.verificado).map((provider) => (
                <div key={provider.id} className="group rounded-3xl border border-stone-100 bg-white p-8 hover:border-brand-camel hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-full border border-stone-100 bg-stone-50/50 flex items-center justify-center text-3xl italic font-black text-brand-charcoal font-serif shadow-inner group-hover:bg-brand-camel/10 transition-colors">
                      {provider.nombre_empresa?.[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black font-serif text-brand-charcoal text-2xl tracking-tight italic leading-none mb-3">{provider.nombre_empresa}</h4>
                      <p className="text-slate-400 text-xs font-medium tracking-tight lowercase">{provider.email}</p>
                      <div className="mt-4 flex items-center gap-6">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-3 py-1 bg-stone-50 rounded-full border border-stone-100">Protocolo v2.1</span>
                         <span className="text-[9px] font-black text-brand-camel uppercase tracking-widest animate-pulse">Pendiente de HASH</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => approveProvider(provider.id)}
                      className="w-16 h-16 rounded-2xl border border-stone-100 bg-white text-brand-charcoal flex items-center justify-center hover:bg-brand-camel hover:text-white transition-all shadow-md active:scale-90 group/btn"
                    >
                      <Check size={32} strokeWidth={1} />
                    </button>
                    <button className="w-16 h-16 rounded-2xl border border-stone-100 bg-white text-brand-charcoal flex items-center justify-center hover:bg-brand-charcoal hover:text-white transition-all shadow-md active:scale-90">
                      <X size={32} strokeWidth={1} />
                    </button>
                  </div>
                </div>
              ))}
              {providers.filter(p => !p.verificado).length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-3xl text-center space-y-6 bg-stone-50/30">
                  <div className="text-6xl grayscale opacity-20">🛡️</div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Cola de seguridad libre</p>
                </div>
              )}
            </div>
          </div>

          {/* Global Activity / Logs */}
          <div className="bg-white boutique-card p-4 shadow-xl shadow-brand-charcoal/5 flex flex-col border border-stone-100 relative">
             <div className="p-10 border-b border-stone-50">
               <h2 className="text-2xl font-black font-serif text-brand-charcoal tracking-tight italic flex items-center gap-4">
                 <ShieldCheck className="text-brand-camel" size={24} strokeWidth={1.5} /> Flujo de Eventos
               </h2>
             </div>
             
             <div className="p-10 flex-grow space-y-10 bg-stone-50/20 rounded-b-3xl">
                {activity.map((log, i) => (
                  <div key={i} className="flex gap-8 items-start pb-10 border-b border-stone-100 last:border-0 last:pb-0 group">
                    <div className="w-12 h-12 rounded-2xl bg-brand-charcoal text-white flex items-center justify-center text-sm font-black font-serif italic shrink-0 shadow-lg shadow-brand-charcoal/10">
                      TX
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-3">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(log.creado_en).toLocaleString()}</span>
                         <span className="text-[9px] font-black bg-brand-camel/10 text-brand-camel px-3 py-1 rounded-full uppercase tracking-tighter italic border border-brand-camel/20">Commit_Exitoso</span>
                       </div>
                       <p className="text-sm font-black font-serif text-brand-charcoal uppercase leading-tight tracking-tight">
                         OPERACIÓN_NODO: PAGO RECIBIDO DE <span className="text-brand-camel">${log.monto_total.toLocaleString()}</span> 
                         <br />
                         <span className="text-[10px] text-slate-400 font-medium tracking-normal mt-2 block lowercase">ORIGEN: {log.orders?.users?.nombre} {log.orders?.users?.apellido}</span>
                       </p>
                    </div>
                    <ArrowUpRight size={20} className="text-slate-200 group-hover:text-brand-camel transition-colors shrink-0" strokeWidth={1.5} />
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="py-32 text-center flex flex-col items-center gap-6 opacity-20">
                    <Clock size={48} strokeWidth={1} className="text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sin eventos detectados</p>
                  </div>
                )}
             </div>
             
             <div className="p-10 border-t border-stone-50 bg-[#FCFBFA] rounded-b-3xl flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Feed en tiempo real activo</span>
                <div className="flex gap-1.5 Items-end h-4">
                  {[1,2,3,4].map(i => <div key={i} className="w-1 bg-brand-camel animate-pulse rounded-full" style={{ height: `${20 + i * 20}%`, animationDelay: `${i * 150}ms` }} />)}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, highlight, isCurrency }: any) {
  return (
    <div className={`p-6 flex flex-col justify-center items-center rounded-2xl border transition-all ${highlight ? 'bg-brand-camel text-white border-brand-camel shadow-lg shadow-brand-camel/20' : 'bg-white text-brand-charcoal border-stone-100 hover:border-brand-camel shadow-sm hover:shadow-md'}`}>
      <span className={`text-[8px] font-black uppercase tracking-widest mb-2 leading-none ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{label}</span>
      <span className="text-2xl font-black font-serif tabular-nums italic leading-none whitespace-nowrap">
        {isCurrency && "$"}
        {value}
      </span>
    </div>
  );
}
