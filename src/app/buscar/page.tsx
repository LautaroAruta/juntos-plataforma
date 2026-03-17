"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Loader2,
  ShoppingBag,
  X,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/home/ProductCard";

const CATEGORIES = [
  "Electrónica", "Ropa", "Alimentos", "Hogar", "Deportes", "Belleza", "Juguetes"
];

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("categoria") || "todas";
  const initialPrecioMin = searchParams.get("precioMin") || "";
  const initialPrecioMax = searchParams.get("precioMax") || "";
  
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState({
    categoria: initialCategory,
    precioMin: initialPrecioMin,
    precioMax: initialPrecioMax,
    soloOfertas: searchParams.get("soloOfertas") === "true",
    orden: searchParams.get("orden") || "relevancia"
  });

  const debouncedQuery = useDebounce(localQuery, 500);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      
      let supabaseQuery = supabase
        .from('products')
        .select(`
          *,
          group_deals (*)
        `);

      if (debouncedQuery) {
        supabaseQuery = supabaseQuery.or(`nombre.ilike.%${debouncedQuery}%,descripcion.ilike.%${debouncedQuery}%`);
      }

      if (activeFilters.categoria !== "todas") {
        supabaseQuery = supabaseQuery.eq('categoria', activeFilters.categoria);
      }

      const { data, error } = await supabaseQuery;

      if (!error && data) {
        let processedResults = data.map(product => {
          const activeDeal = product.group_deals?.find((d: any) => d.estado === 'activo');
          return {
            ...product,
            activeDeal
          };
        });

        // Client-side filtering
        if (activeFilters.precioMin) {
          processedResults = processedResults.filter(p => {
            const price = p.activeDeal ? p.activeDeal.precio_actual : p.precio_individual;
            return price >= Number(activeFilters.precioMin);
          });
        }
        
        if (activeFilters.precioMax) {
           processedResults = processedResults.filter(p => {
            const price = p.activeDeal ? p.activeDeal.precio_actual : p.precio_individual;
            return price <= Number(activeFilters.precioMax);
          });
        }

        if (activeFilters.soloOfertas) {
           processedResults = processedResults.filter(p => !!p.activeDeal);
        }

        // Sorting
        if (activeFilters.orden === "precio-asc") {
          processedResults.sort((a, b) => {
            const pA = a.activeDeal ? a.activeDeal.precio_actual : a.precio_individual;
            const pB = b.activeDeal ? b.activeDeal.precio_actual : b.precio_individual;
            return pA - pB;
          });
        } else if (activeFilters.orden === "precio-desc") {
          processedResults.sort((a, b) => {
            const pA = a.activeDeal ? a.activeDeal.precio_actual : a.precio_individual;
            const pB = b.activeDeal ? b.activeDeal.precio_actual : b.precio_individual;
            return pB - pA;
          });
        }

        setResults(processedResults);
      }
      setLoading(false);
    }

    fetchResults();
  }, [debouncedQuery, activeFilters.categoria, activeFilters.precioMin, activeFilters.precioMax, activeFilters.soloOfertas, activeFilters.orden]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (activeFilters.categoria !== "todas") params.set("categoria", activeFilters.categoria);
    if (activeFilters.precioMin) params.set("precioMin", activeFilters.precioMin);
    if (activeFilters.precioMax) params.set("precioMax", activeFilters.precioMax);
    if (activeFilters.soloOfertas) params.set("soloOfertas", "true");
    if (activeFilters.orden !== "relevancia") params.set("orden", activeFilters.orden);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, activeFilters, router]);

  const removeFilter = (key: string, defaultValue: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: defaultValue }));
  };

  const Sidebar = () => (
    <div className="flex flex-col gap-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Categorías</h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button 
              onClick={() => setActiveFilters(prev => ({ ...prev, categoria: "todas" }))}
              className={`text-sm font-medium ${activeFilters.categoria === "todas" ? "text-[#009EE3] font-bold" : "text-gray-500 hover:text-gray-800"} transition-colors`}
            >
              Todas las categorías
            </button>
          </li>
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button 
                onClick={() => setActiveFilters(prev => ({ ...prev, categoria: cat }))}
                className={`text-sm font-medium ${activeFilters.categoria === cat ? "text-[#009EE3] font-bold" : "text-gray-500 hover:text-gray-800"} transition-colors`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Precio</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Mínimo"
            value={activeFilters.precioMin}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, precioMin: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:border-[#009EE3] outline-none"
          />
          <span className="text-gray-300">-</span>
          <input 
            type="number" 
            placeholder="Máximo"
            value={activeFilters.precioMax}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, precioMax: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:border-[#009EE3] outline-none"
          />
        </div>
      </div>

      {/* Group Deals Only */}
      <div>
        <button 
          onClick={() => setActiveFilters(prev => ({ ...prev, soloOfertas: !prev.soloOfertas }))}
          className="flex items-center gap-3 group"
        >
          <div className={`w-5 h-5 rounded border ${activeFilters.soloOfertas ? "bg-[#009EE3] border-[#009EE3]" : "bg-white border-gray-200"} flex items-center justify-center transition-all`}>
            {activeFilters.soloOfertas && <X size={12} className="text-white" />}
          </div>
          <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Solo ofertas grupales</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header de Búsqueda */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <Link href="/" className="hover:text-[#009EE3]">Inicio</Link>
            <span>/</span>
            <span className="text-gray-800">Búsqueda</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
            {debouncedQuery ? `Resultados para "${debouncedQuery}"` : "Explorar catálogo"}
          </h1>
          <p className="text-gray-500 font-medium">{results.length} productos encontrados</p>
        </div>

        {/* Action Bar (Sorting and Mobile Toggle) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mb-8 sticky top-20 z-30">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
             {/* Applied Filters Tags */}
             {activeFilters.categoria !== "todas" && (
                <span className="bg-[#009EE3]/10 text-[#009EE3] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                  {activeFilters.categoria} <X size={14} className="cursor-pointer" onClick={() => removeFilter("categoria", "todas")} />
                </span>
             )}
             {(activeFilters.precioMin || activeFilters.precioMax) && (
                <span className="bg-[#009EE3]/10 text-[#009EE3] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                  Precio: {activeFilters.precioMin || 0} - {activeFilters.precioMax || "Max"} <X size={14} className="cursor-pointer" onClick={() => { removeFilter("precioMin", ""); removeFilter("precioMax", ""); }} />
                </span>
             )}
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-bold text-xs"
             >
                <Filter size={16} /> Filtros
             </button>
             
             <div className="relative group">
                <select 
                  value={activeFilters.orden}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, orden: e.target.value }))}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-800 outline-none focus:border-[#009EE3] cursor-pointer"
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="precio-asc">Menor precio</option>
                  <option value="precio-desc">Mayor precio</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="animate-spin text-[#009EE3]" size={48} />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando catálogo...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {results.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    deal={item.activeDeal} 
                    product={!item.activeDeal ? item : undefined} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tighter uppercase">No hay resultados</h2>
                <p className="text-gray-500 font-medium mb-10">Intentá con otros filtros o términos de búsqueda.</p>
                <button 
                  onClick={() => setActiveFilters({ categoria: "todas", precioMin: "", precioMax: "", soloOfertas: false, orden: "relevancia" })}
                  className="bg-[#009EE3] text-white font-black px-10 py-4 rounded-2xl uppercase tracking-widest text-xs"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Filtros</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-50 rounded-xl">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Sidebar />
          </div>
          <div className="p-6 border-t border-gray-100">
             <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-[#009EE3] text-white font-black py-4 rounded-2xl uppercase tracking-widest"
             >
                Aplicar filtros
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 bg-[#F5F5F5] min-h-screen">
        <Loader2 className="animate-spin text-[#009EE3]" size={64} />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
