"use client";

import { useEffect, useState } from "react";
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
  Share2,
  QrCode,
  MapPin,
  Download,
  BarChart3
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CircularAvatars } from "@/components/dashboard/CircularAvatars";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: "$0",
    activeParticipants: 0,
    completedDeals: 0,
    isMpConnected: false
  });
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session]);

  async function fetchStats(providerProducts?: any[]) {
    const providerId = session?.user?.id;
    if (!providerId) return;

    const targetProducts = providerProducts || products;
    if (targetProducts.length === 0) return;

    // 1. Total Sales (Paid orders)
    const { data: salesData } = await supabase
      .from('orders')
      .select('total')
      .eq('provider_id', providerId)
      .in('estado', ['pagado', 'pendiente_retiro', 'entregado'])
      .eq('arrepentimiento_solicitado', false);

    const totalSales = salesData?.reduce((acc, order) => acc + Number(order.total), 0) || 0;

    // 2. Active Participants
    // First get the products for this provider, then their active deals
    const { data: dealsData } = await supabase
      .from('group_deals')
      .select('participantes_actuales')
      .eq('estado', 'activo')
      .in('product_id', targetProducts.map(p => p.id));

    const totalParticipants = dealsData?.reduce((acc, deal) => acc + deal.participantes_actuales, 0) || 0;

    // 3. Completed Deals
    const { count: completedCount } = await supabase
      .from('group_deals')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'completado')
      .in('product_id', targetProducts.map(p => p.id));

    // 4. Sales History for Chart (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: chartData } = await supabase
      .from('orders')
      .select('total, creado_en')
      .eq('provider_id', providerId)
      .in('estado', ['pagado', 'pendiente_retiro', 'entregado'])
      .eq('arrepentimiento_solicitado', false)
      .gte('creado_en', sevenDaysAgo.toISOString());

    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const chartStats = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: days[d.getDay()], 
        sales: 0,
        dateStr: d.toISOString().split('T')[0]
      };
    });

    chartData?.forEach(order => {
      const dateStr = new Date(order.creado_en).toISOString().split('T')[0];
      const dayStat = chartStats.find(s => s.dateStr === dateStr);
      if (dayStat) dayStat.sales += Number(order.total);
    });

    setSalesHistory(chartStats);

    setStats(prev => ({
      ...prev,
      totalSales: formatCurrency(totalSales),
      activeParticipants: totalParticipants,
      completedDeals: completedCount || 0
    }));
  }

  async function fetchProducts() {
    setLoading(true);
    const providerId = session?.user?.id;

    if (!providerId) {
       setLoading(false);
       return;
    }

    // Fetch provider connection status
    const { data: provider } = await supabase
      .from('providers')
      .select('mp_access_token')
      .eq('id', providerId)
      .single();

    setStats(prev => ({ ...prev, isMpConnected: !!provider?.mp_access_token }));

    const { data, error } = await supabase
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
      .eq('provider_id', providerId)
      .order('creado_en', { ascending: false });

    if (!error) {
      const fetchedProducts = data || [];
      setProducts(fetchedProducts);
      fetchStats(fetchedProducts);
    }
    setLoading(false);
  }

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el producto");
      }
      
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast.success("Producto eliminado permanentemente");
      setProductToDelete(null);
      
      // Forzar actualización de cache y estado
      router.refresh();
      setTimeout(() => fetchProducts(), 500);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast.error(`Error: ${err.message || "No se pudo eliminar el producto"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const shareOnWhatsApp = (product: any) => {
    const text = `¡Mirá esta oferta en BANDHA! Precio grupal de $${product.precio_grupal_minimo} en ${product.nombre}. Sumate acá: ${window.location.origin}/productos/${product.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-black pb-10">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-[-0.05em] uppercase leading-none italic">
              VNDR_CONSOLE
            </h1>
            <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] pl-1">
              SISTEMA DE GESTIÓN OPERATIVA // v4.0.2
            </p>
          </div>
          <Link 
            href="/provider/dashboard/new-product"
            className="group relative bg-[#FF5C00] text-black border-2 border-black px-10 py-5 font-black text-sm uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
          >
            <div className="flex items-center gap-3 relative z-10">
              <Plus size={20} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-300" /> 
              REGISTRAR_PRODUCTO
            </div>
          </Link>
        </div>

        {/* Mercado Pago Connection Alert */}
        {!stats.isMpConnected && (
          <div className="bg-black text-white border-4 border-black p-10 shadow-[16px_16px_0px_0px_rgba(255,92,0,1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,92,0,0.1),transparent)] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-[#FF5C00] text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <AlertCircle size={40} strokeWidth={3} />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic">ALERTA_CONEXIÓN_PAGOS</h2>
                  <p className="text-white/40 font-black uppercase text-[10px] tracking-widest max-w-md">VINCULÁ TU MERCADO_PAGO PARA ACTIVAR EL PROCESAMIENTO AUTOMÁTICO DE CRÉDITOS.</p>
                </div>
              </div>

              <Link
                href={`/api/provider/mp-connect?state=${btoa(JSON.stringify({ provider_id: session?.user?.id }))}`}
                className="bg-white text-black border-2 border-black px-12 py-5 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all whitespace-nowrap"
              >
                VINCULAR_PROTOCOL
              </Link>
            </div>
          </div>
        )}

        {/* Stats & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-8 border-b-2 border-black/5 pb-4">
              <div className="flex items-center gap-3">
                 <BarChart3 size={20} className="text-[#FF5C00]" strokeWidth={3} />
                 <h3 className="text-xs font-black text-black uppercase tracking-[0.3em]">ANALYSIS_REPORT_01</h3>
              </div>
              <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest italic">LAST_7_DAYS</div>
            </div>
            <div className="h-[300px]">
              <SalesChart data={salesHistory.length > 0 ? salesHistory : undefined} />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/provider/ordenes" className="block group">
              <StatCard title="VENTAS_LIQUIDADAS" value={stats.totalSales} icon={<TrendingUp className="text-[#FF5C00]" strokeWidth={3} />} />
            </Link>
            <div className="block">
              <StatCard title="NODOS_ACTIVOS" value={stats.activeParticipants.toString()} icon={<Users className="text-black" strokeWidth={3} />} />
            </div>
            <Link href="/provider/analytics" className="block group">
              <StatCard 
                title="METRICS_INSIGHTS" 
                value="VER_DATA" 
                icon={<BarChart3 className="text-black" strokeWidth={3} />} 
              />
            </Link>
            <Link href="/provider/scanner" className="block group">
              <StatCard 
                title="NODE_VALIDATOR" 
                value="SCAN_QR" 
                icon={<QrCode className="text-black" strokeWidth={3} />} 
              />
            </Link>
            <Link href="/provider/pickup-points" className="block group">
              <StatCard 
                title="LOGISTICS_POINTS" 
                value="GESTIÓN" 
                icon={<MapPin className="text-black" strokeWidth={3} />} 
              />
            </Link>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-10 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-10 bg-black text-white">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#FF5C00] border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <Package size={32} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black tracking-[-0.05em] uppercase italic">INVENTARIO_CORE</h2>
                <p className="text-[#FF5C00] font-black text-[9px] uppercase tracking-[0.3em]">TOTAL_RECORDS: {products.length}</p>
              </div>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={3} />
              <input 
                type="text" 
                placeholder="BUSCAR_ENTRY..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border-2 border-white/20 focus:border-[#FF5C00] py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest transition-all outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] border-b-2 border-black text-black/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="px-10 py-6">DATA_PRODUCTO</th>
                  <th className="px-10 py-6">METRICS_PRICE</th>
                  <th className="px-10 py-6">STOCK_LEVEL</th>
                  <th className="px-10 py-6">NODE_PROGRESS</th>
                  <th className="px-10 py-6 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-[#FF5C00] border-t-transparent mx-auto" stroke-width="8" />
                  </td></tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center bg-[#F5F5F5]">
                      <div className="flex flex-col items-center gap-6">
                        <AlertCircle className="text-black/10" size={80} strokeWidth={1} />
                        <p className="text-black/30 font-black uppercase text-sm tracking-widest italic">VACUUM_DETECTED: INVENTARIO_VACIO</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F5F5F5] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all shrink-0">
                          {product.imagen_principal ? (
                            <img src={product.imagen_principal} alt={product.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black/10"><Package size={24} /></div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="font-black text-black text-xl uppercase tracking-tighter leading-none italic">{product.nombre}</div>
                          <div className="text-[9px] font-black text-white uppercase tracking-widest bg-black px-2 py-1 inline-block">
                            {product.categoria}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <div className="text-black/30 font-black text-xs line-through decoration-black/20 font-mono">${product.precio_individual}</div>
                        <div className="text-[#FF5C00] font-black text-3xl tracking-tighter tabular-nums leading-none italic">${product.precio_grupal_minimo}</div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-3 border-2 border-black px-4 py-2 text-[10px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all ${
                        product.stock > 10 ? 'bg-black text-white' : 'bg-[#FF5C00] text-black'
                      }`}>
                        <div className={`w-2 h-2 ${product.stock > 10 ? 'bg-[#FF5C00]' : 'bg-black animate-pulse'}`} />
                        {product.stock} UNITS_CORE
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {product.group_deals?.[0] ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[9px] font-black text-black/40 uppercase tracking-widest mb-2">
                            <span>PROGRESS</span>
                            <span className="text-black font-mono">{(product.group_deals[0].participantes_actuales / product.group_deals[0].min_participantes * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-4 bg-[#F5F5F5] border-2 border-black p-[2px]">
                            <div 
                              className="h-full bg-[#FF5C00]" 
                              style={{ width: `${Math.min(100, (product.group_deals[0].participantes_actuales / product.group_deals[0].min_participantes * 100))}%` }} 
                            />
                          </div>
                          <div className="text-[9px] font-black text-black uppercase tracking-tight italic">
                            {product.group_deals[0].participantes_actuales} / {product.group_deals[0].min_participantes} NODES
                          </div>
                        </div>
                      ) : (
                        <span className="text-black/20 text-[9px] font-black uppercase tracking-widest border-2 border-dashed border-black/10 px-4 py-2 italic">IDLE_DEAL</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                           onClick={() => shareOnWhatsApp(product)}
                           className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-[#FF5C00] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                           title="SHARE_WA"
                        >
                          <Share2 size={24} strokeWidth={3} />
                        </button>
                        {product.group_deals?.[0] && (
                           <button
                              onClick={() => window.open(`/api/provider/deals/${product.group_deals[0].id}/export`, '_blank')}
                              className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                              title="EXPORT_REPORT"
                           >
                              <Download size={24} strokeWidth={3} />
                           </button>
                        )}
                        <Link 
                          href={`/provider/dashboard/edit/${product.id}`}
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                          <Edit2 size={24} strokeWidth={3} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-red-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                          <Trash2 size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setProductToDelete(null)}
          />
          <div className="relative bg-white border-4 border-black p-12 max-w-md w-full shadow-[24px_24px_0px_0px_rgba(255,92,0,1)] text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-[#FF5C00] text-black border-2 border-black flex items-center justify-center mx-auto mb-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Trash2 size={56} strokeWidth={3} className={isDeleting ? "animate-pulse" : ""} />
            </div>
            
            <h2 className="text-4xl font-black text-black uppercase tracking-[-0.05em] mb-4 leading-none italic">
              PURGE_RECORD?
            </h2>
            <p className="text-black/50 font-black uppercase text-[10px] tracking-widest mb-12 px-4 leading-relaxed">
              ESTÁS POR ELIMINAR EL REGISTRO <span className="text-black">{productToDelete.name}</span>. ESTA ACCIÓN ES IRREVERSIBLE EN EL CORE_DB.
            </p>

            <div className="space-y-4">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full bg-black text-white border-2 border-black font-black py-5 uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {isDeleting ? "W_DELETING..." : "CONFIRM_PURGE"}
              </button>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="w-full bg-white text-black border-2 border-black font-black py-4 uppercase tracking-widest text-xs hover:bg-[#F5F5F5] transition-all disabled:opacity-50"
              >
                CANCEL_X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
      <div className="space-y-4">
        <p className="text-black/40 text-[9px] font-black uppercase tracking-[0.3em] italic">{title}</p>
        <p className="text-4xl font-black text-black tracking-tighter italic tabular-nums leading-none">{value}</p>
      </div>
      <div className={`w-16 h-16 border-2 border-black bg-[#F5F5F5] group-hover:bg-[#FF5C00] transition-colors flex items-center justify-center text-3xl`}>
        {icon}
      </div>
    </div>
  );
}
