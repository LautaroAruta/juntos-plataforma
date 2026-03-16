import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/home/ProductCard";
import { ChevronLeft, Filter, ArrowUpDown, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug);
  const supabase = await createClient();

  // Fetch products and active deals for this category
  const { data: allDeals } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .eq('product.categoria', decodedCategory)
    .order('creado_en', { ascending: false });

  const validDeals = (allDeals || []).filter((d: any) => d.product !== null);

  // If no group deals, fetch individual products in this category
  const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('categoria', decodedCategory)
      .order('creado_en', { ascending: false });

  const categoryConfigs: Record<string, { color: string, description: string }> = {
      "Electrónica": { color: "from-blue-600 to-indigo-700", description: "Lo último en tecnología con precios de fábrica." },
      "Ropa": { color: "from-pink-500 to-rose-700", description: "Moda y tendencia para renovar tu placard ahorrando." },
      "Alimentos": { color: "from-green-500 to-emerald-700", description: "Tus consumos diarios al mejor precio mayorista." },
      "Hogar": { color: "from-orange-500 to-amber-700", description: "Todo para tu casa en compras compartidas." },
      "Deportes": { color: "from-red-500 to-orange-700", description: "Equipamiento profesional para tu entrenamiento." },
      "Belleza": { color: "from-purple-500 to-indigo-700", description: "Cuidado personal y estética con descuentos exclusivos." },
  };

  const config = categoryConfigs[decodedCategory] || { color: "from-gray-600 to-slate-800", description: "Explorá todas las ofertas de esta categoría." };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Category Hero */}
      <section className={`w-full bg-gradient-to-br ${config.color} pt-12 pb-20 px-4 md:px-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al Inicio
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              {decodedCategory}
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="text-sm font-bold text-gray-500">
            Mostrando <span className="text-gray-800">{allDeals?.length || 0} ofertas grupales</span>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-xs hover:border-[#009EE3] transition-all">
               <Filter size={16} /> Filtros
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-xs hover:border-[#009EE3] transition-all">
               <ArrowUpDown size={16} /> Ordenar
             </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
           {!validDeals || validDeals.length === 0 ? (
             <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-2">No hay ofertas activas</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">¡Sé el primero en pedir un producto de esta categoría!</p>
             </div>
           ) : (
             validDeals.map((deal: any) => (
                <ProductCard key={deal.id} deal={deal} />
             ))
           )}
        </div>

        {/* Individual Products (Optional/Secondary) */}
        {products && products.length > (validDeals?.length || 0) && (
            <div className="mt-20">
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-8">Todos los productos en {decodedCategory}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product: any) => {
                        const hasDeal = validDeals?.some(d => d.product.id === product.id);
                        if (hasDeal) return null; // Already shown in the top grid

                        return (
                            <Link 
                                href={`/productos/${product.id}`}
                                key={product.id}
                                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-50 group flex flex-col"
                            >
                                <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden shrink-0">
                                    <img 
                                        src={product.imagen_principal || "/placeholder-product.jpg"} 
                                        alt={product.nombre}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-snug group-hover:text-[#009EE3] transition-colors">{product.nombre}</h4>
                                <div className="mt-auto">
                                    <p className="font-black text-lg text-gray-900 tracking-tight">${product.precio_individual.toLocaleString()}</p>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Precio Individual</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
