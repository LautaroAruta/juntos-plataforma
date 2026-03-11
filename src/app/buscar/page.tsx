"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Users, 
  Timer, 
  ChevronRight,
  Loader2,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("categoria") || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    categoria: categoryParam,
    precioMin: "",
    precioMax: "",
    soloOfertas: false
  });
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      
      // Buscamos productos que coincidan con el nombre o descripción
      let supabaseQuery = supabase
        .from('products')
        .select(`
          *,
          group_deals (*)
        `);

      if (query) {
        supabaseQuery = supabaseQuery.or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);
      }

      if (categoryParam) {
        supabaseQuery = supabaseQuery.eq('categoria', categoryParam);
      }

      const { data, error } = await supabaseQuery;

      if (!error && data) {
        // Procesamos los resultados para identificar ofertas activas
        const processedResults = data.map(product => {
          const activeDeal = product.group_deals?.find((d: any) => d.estado === 'activo');
          return {
            ...product,
            activeDeal
          };
        });
        setResults(processedResults);
      }
      setLoading(false);
    }

    fetchResults();
  }, [query, categoryParam]);

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
    // En una implementación real, esto actualizaría los query params
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Search Info & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00AEEF] tracking-widest mb-1">
                Buscador JUNTOS
             </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
              {query ? `Buscas: "${query}"` : "Explorando productos"}
            </h1>
            <p className="text-gray-500 font-medium">{results.length} productos encontrados</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:border-[#00AEEF] hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={18} /> Filtrar
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:border-[#00AEEF] hover:bg-gray-50 transition-all shadow-sm">
              <ArrowUpDown size={18} /> Ordenar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <Loader2 className="animate-spin text-[#00AEEF]" size={64} />
              <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" size={24} />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Sincronizando ofertas...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {results.map((item) => {
              const hasDeal = !!item.activeDeal;
              const price = hasDeal ? item.activeDeal.precio_actual : item.precio_individual;
              const originalPrice = item.precio_individual;
              const discount = hasDeal ? Math.round((1 - price / originalPrice) * 100) : 0;
              const progress = hasDeal ? (item.activeDeal.participantes_actuales / item.activeDeal.min_participantes) * 100 : 0;

              return (
                <Link 
                  href={`/productos/${item.id}`}
                  key={item.id}
                  className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col relative"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-white border-b border-gray-50">
                     <img 
                      src={item.imagen_principal || "/placeholder-product.jpg"} 
                      alt={item.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-[#00AEEF] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {discount}% AHORRO
                      </div>
                    )}
                    {hasDeal && (
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.2 rounded-lg shadow-sm border border-white/50">
                        <span className="text-[9px] font-black uppercase text-[#0077CC] tracking-tighter flex items-center gap-1">
                          <Users size={10} /> OFERTA GRUPAL
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">{item.categoria}</div>
                    <h3 className="text-lg font-black text-gray-800 leading-tight mb-4 group-hover:text-[#00AEEF] transition-colors line-clamp-2">
                      {item.nombre}
                    </h3>
                    
                    <div className="flex flex-col mb-6">
                      {hasDeal && (
                        <span className="text-xs text-gray-300 line-through font-bold">
                          ${originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-3xl font-black text-[#00AEEF] tracking-tighter">
                        ${price.toLocaleString()}
                      </span>
                    </div>

                    {hasDeal && (
                      <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-gray-400">
                          <span className="flex items-center gap-1">
                            {item.activeDeal.participantes_actuales}/{item.activeDeal.min_participantes} unidos
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <Timer size={12} /> 23h 59m
                          </span>
                        </div>

                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00AEEF] to-[#0077CC] rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {!hasDeal && (
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <ChevronRight size={14} className="text-[#00AEEF]" /> Ver detalles
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShoppingBag size={48} className="text-gray-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tighter uppercase">No encontramos resultados</h2>
            <p className="text-gray-500 font-medium mb-10">
              Intentá con términos más generales como "Electrónica" o revisá que no haya errores de tipeo.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-[#00AEEF]/20 transition-all uppercase tracking-tight active:scale-95"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 bg-[#F5F5F5] min-h-screen">
        <Loader2 className="animate-spin text-[#00AEEF]" size={64} />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
