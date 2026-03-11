"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Plus, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Search
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProviderDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      // In a real app, filter by actual provider_id from session
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
        .order('creado_en', { ascending: false });

      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Panel de Control</h1>
          <p className="text-slate-500">Gestioná tus productos y ofertas grupales</p>
        </div>
        <Link 
          href="/provider/dashboard/new-product"
          className="bg-[#0077CC] hover:bg-[#00AEEF] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-[#0077CC]/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Nuevo Producto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales" value="$245.000" icon={<TrendingUp className="text-green-500" />} />
        <StatCard title="Participantes Activos" value="128" icon={<Users className="text-blue-500" />} />
        <StatCard title="Deals Completados" value="14" icon={<CheckCircle2 className="text-[#00AEEF]" />} />
      </div>

      {/* Main Content: Products List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-[#0077CC]" size={20} /> Mis Productos
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0077CC]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Precio (Ind/Grupal)</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Oferta Grupal</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Cargando productos...</td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="text-slate-300" size={48} />
                      <p className="text-slate-500 font-bold">No tenés productos cargados aún.</p>
                      <Link href="/provider/dashboard/new-product" className="text-[#0077CC] text-sm font-bold">Cargar mi primer producto</Link>
                    </div>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        {product.imagen_principal ? (
                          <img src={product.imagen_principal} alt={product.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{product.nombre}</div>
                        <div className="text-slate-400 text-xs truncate max-w-[150px]">{product.categoria}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-bold text-slate-700">${product.precio_individual}</div>
                    <div className="text-[#0077CC] font-black text-xs">${product.precio_grupal_minimo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {product.stock} unid.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.group_deals?.[0] ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">{product.group_deals[0].participantes_actuales}/{product.group_deals[0].min_participantes}</span>
                          <span className="text-[#00AEEF]">
                            {Math.round((product.group_deals[0].participantes_actuales / product.group_deals[0].min_participantes) * 100)}%
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#00AEEF] rounded-full" 
                            style={{ width: `${Math.min(100, (product.group_deals[0].participantes_actuales / product.group_deals[0].min_participantes) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">Sin oferta</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${product.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${product.activo ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {product.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
        {icon}
      </div>
    </div>
  );
}
