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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CircularAvatars } from "@/components/dashboard/CircularAvatars";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useSession } from "next-auth/react";

export default function ProviderDashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: "$0",
    activeParticipants: 0,
    completedDeals: 0
  });
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
      fetchStats();
    }
  }, [session]);

  async function fetchStats() {
    // Simulación de estadísticas reales para la demo inicial
    setStats({
      totalSales: "$245.800",
      activeParticipants: 142,
      completedDeals: 18
    });
  }

  async function fetchProducts() {
    setLoading(true);
    const providerId = session?.user?.id;

    if (!providerId) {
       setLoading(false);
       return;
    }

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

    if (!error) setProducts(data || []);
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
    const text = `¡Mirá esta oferta en BANDHA! Falta poco para desbloquear el precio grupal de $${product.precio_grupal_minimo} en ${product.nombre}. Sumate acá: ${window.location.origin}/productos/${product.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              PANEL <span className="text-[#009EE3]">PROVEEDOR</span>
            </h1>
            <p className="text-slate-500 font-medium">Gestioná tu inventario y maximizá tus ventas grupales.</p>
          </div>
          <Link 
            href="/provider/dashboard/new-product"
            className="bg-[#00A650] hover:bg-[#009EE3] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#00A650]/20 transition-all flex items-center justify-center gap-2 group transform hover:-translate-y-1"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            CREAR PRODUCTO
          </Link>
        </div>

        {/* Stats & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Rendimiento de Ventas</h3>
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Últimos 7 días</div>
            </div>
            <SalesChart />
          </div>

          <div className="flex flex-col gap-6">
            <StatCard title="Ventas Totales" value={stats.totalSales} icon={<TrendingUp className="text-green-500" />} color="bg-green-50" />
            <StatCard title="Participantes" value={stats.activeParticipants.toString()} icon={<Users className="text-blue-500" />} color="bg-blue-50" />
            <StatCard title="Deals Cerrados" value={stats.completedDeals.toString()} icon={<CheckCircle2 className="text-[#009EE3]" />} color="bg-sky-50" />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE500]/20 flex items-center justify-center text-[#E5CE00]">
                <Package size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">MI INVENTARIO</h2>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o categoría..." 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#009EE3]/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Producto</th>
                  <th className="px-8 py-5">Precios (Ind / Grupal)</th>
                  <th className="px-8 py-5">Stock</th>
                  <th className="px-8 py-5">Progreso de Oferta</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-[#009EE3] border-t-transparent rounded-full mx-auto" /></td></tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="text-slate-200" size={64} />
                        <p className="text-slate-400 font-bold text-lg">No hay productos que mostrar todavía.</p>
                      </div>
                    </td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-100 group-hover:border-[#009EE3]/30 transition-colors shrink-0 shadow-sm">
                          {product.imagen_principal ? (
                            <img src={product.imagen_principal} alt={product.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-slate-800 text-base">{product.nombre}</div>
                          <div className="text-[10px] font-black text-[#00A650] uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-md inline-block">
                            {product.categoria}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="text-slate-400 font-bold text-sm line-through decoration-slate-300">${product.precio_individual}</div>
                        <div className="text-[#00A650] font-black text-xl tracking-tighter">${product.precio_grupal_minimo}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        {product.stock} UNI.
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {product.group_deals?.[0] ? (
                        <div className="space-y-3">
                          <CircularAvatars 
                             current={product.group_deals[0].participantes_actuales} 
                             min={product.group_deals[0].min_participantes} 
                          />
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs font-bold italic tracking-wide">SIN OFERTA ACTIVA</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => shareOnWhatsApp(product)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                          title="Compartir en WhatsApp"
                        >
                          <Share2 size={18} />
                        </button>
                        <Link 
                          href={`/provider/dashboard/edit/${product.id}`}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !isDeleting && setProductToDelete(null)}
          />
          <div className="relative bg-white rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 fade-in duration-300 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Trash2 size={48} className={isDeleting ? "animate-pulse" : ""} />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4 leading-none">
              ¿Eliminar <br /> Producto?
            </h2>
            <p className="text-slate-500 font-medium mb-10 px-4">
              Estás por eliminar <span className="text-slate-900 font-bold">&quot;{productToDelete.name}&quot;</span>. Esta acción es permanente y no se puede deshacer.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all uppercase tracking-tight flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar ahora"}
              </button>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-tight text-xs disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-[#009EE3]/10 shadow-lg shadow-slate-200/40 flex items-center justify-between group transition-all hover:scale-105">
      <div className="space-y-1">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl transition-transform group-hover:rotate-12`}>
        {icon}
      </div>
    </div>
  );
}
