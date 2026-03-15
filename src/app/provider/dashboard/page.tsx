"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Plus, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Trash2,
  Edit2,
  ChevronRight,
  ShoppingBag,
  Bell,
  QrCode,
  Loader2,
  RefreshCw,
  DollarSign,
  History,
  CreditCard
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import QRScannerModal from "@/components/shared/QRScannerModal";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'finances'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    // 1. Obtener datos del proveedor vinculados al usuario autenticado
    const { data: provider, error: pError } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (pError || !provider) {
      console.error("Error fetching provider info:", pError);
      setLoading(false);
      return;
    }
    setProviderData(provider);

    // 2. Cargar Productos
    const { data: prods } = await supabase
      .from('products')
      .select(`
        *,
        group_deals (
          id,
          participantes_actuales,
          min_participantes,
          estado
        )
      `)
      .eq('provider_id', provider.id)
      .order('creado_en', { ascending: false });

    setProducts(prods || []);

    // 3. Cargar Ventas (Order Items)
    const { data: salesData } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        variant,
        creado_en,
        product:products (nombre, imagen_principal),
        order:orders (
          id,
          estado,
          user:users (nombre, email),
          payments (estado_pago_proveedor)
        )
      `)
      .eq('provider_id', provider.id)
      .order('creado_en', { ascending: false });

    setSales(salesData || []);

    // 4. Cargar Liquidaciones (Payouts)
    const { data: payoutsData } = await supabase
      .from('provider_payouts')
      .select('*')
      .eq('provider_id', provider.id)
      .order('creado_en', { ascending: false });

    setPayouts(payoutsData || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchDashboardData();

    // SUSCRIPCIÓN REAL-TIME: Notificar nuevas ventas
    const channel = supabase
      .channel('new-sales')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_items' },
        (payload) => {
          if (payload.new.provider_id === providerData?.id) {
            toast.success("¡Nueva venta recibida!", {
              description: "Revisa la pestaña de Ventas para más detalles.",
              icon: <Bell className="text-blue-500" />
            });
            fetchDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData, providerData?.id, supabase]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro que querés eliminar "${name}"?`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success("Producto eliminado");
    } catch (err) {
      toast.error("No se pudo eliminar el producto.");
    }
  };

  const stats = {
    totalSales: sales.reduce((acc, sale) => acc + (sale.quantity * sale.unit_price), 0),
    activeParticipants: products.reduce((acc, p) => acc + (p.group_deals?.[0]?.participantes_actuales || 0), 0),
    completedDeals: products.reduce((acc, p) => acc + (p.group_deals?.[0]?.estado === 'completado' ? 1 : 0), 0)
  };

  const handleVerifyOrder = async (orderId: string) => {
    const res = await fetch("/api/orders/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al verificar");
    
    // Refresh data after successful verification
    fetchDashboardData();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Modal de Escaneo QR */}
      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onVerify={handleVerifyOrder}
      />

      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Dashboard</h1>
          <p className="text-slate-500 font-medium">Panel de {providerData?.nombre_empresa || 'Proveedor'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-white border-2 border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-[#009EE3] hover:border-[#009EE3]/20 transition-all shadow-sm flex items-center gap-2 group"
          >
            <QrCode size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#009EE3] hidden sm:block">Validar Retiro</span>
          </button>
          <Link 
            href="/provider/dashboard/new-product"
            className="bg-[#00A650] hover:bg-[#009EE3] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-[#00A650]/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales" value={`$${stats.totalSales.toLocaleString()}`} icon={<TrendingUp className="text-green-500" />} />
        <StatCard title="Participantes Activos" value={stats.activeParticipants.toString()} icon={<Users className="text-blue-500" />} />
        <StatCard title="Deals Completados" value={stats.completedDeals.toString()} icon={<CheckCircle2 className="text-[#009EE3]" />} />
      </div>

      {/* Tabs Support */}
      <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Productos
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Ventas {sales.length > 0 && <span className="ml-1 bg-[#009EE3] text-white px-1.5 py-0.5 rounded-md text-[8px]">{sales.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('finances')}
          className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'finances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Finanzas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'products' ? (
          <motion.div 
            key="products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <TableProducts products={products} loading={loading} onDelete={handleDelete} />
          </motion.div>
        ) : activeTab === 'sales' ? (
          <motion.div 
            key="sales"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <TableSales sales={sales} loading={loading} />
          </motion.div>
        ) : (
          <motion.div 
            key="finances"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                    ${sales
                      .filter(s => s.order?.estado === 'pagado' && s.order?.payments?.[0]?.estado_pago_proveedor === 'pendiente')
                      .reduce((acc, s) => acc + (s.quantity * s.unit_price) * 0.95, 0)
                      .toLocaleString()}
                  <p className="text-[9px] text-slate-400 mt-2">* Monto estimado neto de comisiones (5%)</p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Cobrado</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">
                    ${payouts.reduce((acc, p) => acc + Number(p.monto_total), 0).toLocaleString()}
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
               <div className="p-8 border-b border-slate-50">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Historial de Liquidaciones</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pagos transferidos por BANDHA</p>
               </div>
               <TablePayouts payouts={payouts} loading={loading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TablePayouts({ payouts, loading }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
            <th className="px-8 py-5">Referencia</th>
            <th className="px-8 py-5">Fecha</th>
            <th className="px-8 py-5">Monto Liquidado</th>
            <th className="px-8 py-5">Estado</th>
            <th className="px-8 py-5 text-right">Comprobante</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
             <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-200" size={40} /></td></tr>
          ) : payouts.length === 0 ? (
            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No hay liquidaciones aún</td></tr>
          ) : payouts.map((p: any) => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-4 font-bold text-slate-600 text-xs">#{p.id.split('-')[0]}</td>
              <td className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">
                {new Date(p.creado_en).toLocaleString('es-AR')}
              </td>
              <td className="px-8 py-4 font-black text-slate-800">${p.monto_total.toLocaleString()}</td>
              <td className="px-8 py-4">
                 <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[8px] font-black uppercase">
                    Completado
                 </span>
              </td>
              <td className="px-8 py-4 text-right">
                {p.comprobante_url ? (
                  <a href={p.comprobante_url} target="_blank" className="p-2 text-[#009EE3] hover:bg-blue-50 rounded-lg inline-block">
                    <History size={16} />
                  </a>
                ) : <span className="text-[8px] font-black text-slate-300 uppercase">Procesado</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableProducts({ products, loading, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
            <th className="px-8 py-5">Producto</th>
            <th className="px-8 py-5">Precio</th>
            <th className="px-8 py-5">Stock</th>
            <th className="px-8 py-5">Estado Grupal</th>
            <th className="px-8 py-5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
             <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-200" size={40} /></td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No hay productos</td></tr>
          ) : products.map((p: any) => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-4">
                <div className="flex items-center gap-4">
                  <img src={p.imagen_principal} className="w-12 h-12 rounded-xl object-cover bg-slate-50" alt="" />
                  <div>
                    <div className="font-black text-slate-800 text-sm">{p.nombre}</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.categoria}</div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-4 text-sm font-black text-slate-700">${p.precio_individual}</td>
              <td className="px-8 py-4 text-sm font-black text-slate-700">{p.stock}</td>
              <td className="px-8 py-4">
                 {p.group_deals?.[0] ? (
                   <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#009EE3]" style={{ width: `${(p.group_deals[0].participantes_actuales / p.group_deals[0].min_participantes) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{p.group_deals[0].participantes_actuales}/{p.group_deals[0].min_participantes}</span>
                   </div>
                 ) : '-' }
              </td>
              <td className="px-8 py-4 text-right">
                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(p.id, p.nombre)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                 </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSales({ sales, loading }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
            <th className="px-8 py-5">Fecha</th>
            <th className="px-8 py-5">Producto</th>
            <th className="px-8 py-5">Cliente</th>
            <th className="px-8 py-5">Total</th>
            <th className="px-8 py-5">Estado</th>
            <th className="px-8 py-5 text-right">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center"><Loader2 className="mx-auto animate-spin text-slate-200" size={40} /></td></tr>
          ) : sales.length === 0 ? (
            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No hay ventas aún</td></tr>
          ) : sales.map((sale: any) => (
            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">
                {new Date(sale.creado_en).toLocaleDateString('es-AR')}
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 overflow-hidden border border-slate-100">
                    <img src={sale.product?.imagen_principal} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-xs">{sale.product?.nombre}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{sale.variant || 'Standard'}</div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-4">
                 <div className="text-xs font-bold text-slate-700">{sale.order?.user?.nombre}</div>
                 <div className="text-[10px] text-slate-400">{sale.order?.user?.email}</div>
              </td>
              <td className="px-8 py-4 text-xs font-black text-slate-800">
                ${(sale.quantity * sale.unit_price).toLocaleString()}
              </td>
              <td className="px-8 py-4">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                  sale.order?.estado === 'pagado' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {sale.order?.estado.replace('_', ' ')}
                </span>
              </td>
              <td className="px-8 py-4 text-right">
                <button className="text-slate-300 hover:text-[#009EE3]">
                  <ChevronRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center justify-between group hover:border-[#009EE3]/20 transition-all">
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
        <p className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-[#009EE3] transition-colors">{value}</p>
      </div>
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl group-hover:bg-[#009EE3]/5 transition-all">
        {icon}
      </div>
    </div>
  );
}
