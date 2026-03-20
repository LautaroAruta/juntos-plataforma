import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/home/ProductCard";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/constants/categories";
import CategoryToolbar from "@/components/category/CategoryToolbar";

// Garantizar que la página siempre obtenga datos frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ sort?: string, minPrice?: string, maxPrice?: string, urgent?: string }> 
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const { sort, minPrice, maxPrice, urgent } = sParams;
  const category = getCategoryBySlug(slug);
  const supabase = await createClient();

  const categorySearchTerm = category ? category.id : decodeURIComponent(slug);
  const categoryDisplayName = category ? category.name : categorySearchTerm;

  // 1. Fetch Deals
  let dealsQuery = supabase
    .from('group_deals')
    .select(`
      *,
      product:products!inner(*)
    `)
    .eq('estado', 'activo')
    .eq('product.categoria', categorySearchTerm);

  if (minPrice) dealsQuery = dealsQuery.gte('precio_actual', Number(minPrice));
  if (maxPrice) dealsQuery = dealsQuery.lte('precio_actual', Number(maxPrice));

  if (urgent === "true") {
    dealsQuery = dealsQuery.order('participantes_actuales', { ascending: false }).order('id', { ascending: true });
  } else if (sort === "price_asc") {
    dealsQuery = dealsQuery.order('precio_actual', { ascending: true }).order('id', { ascending: true });
  } else if (sort === "price_desc") {
    dealsQuery = dealsQuery.order('precio_actual', { ascending: false }).order('id', { ascending: true });
  } else if (sort === "popular") {
    dealsQuery = dealsQuery.order('min_participantes', { ascending: false }).order('id', { ascending: true });
  } else {
    dealsQuery = dealsQuery.order('creado_en', { ascending: false }).order('id', { ascending: true });
  }

  const { data: allDeals, error: dealsError } = await dealsQuery;

  // Deduplicar ofertas por producto (por si acaso un producto tiene >1 oferta activa)
  // Siempre nos quedamos con la primera según el orden elegido
  const seenProducts = new Set();
  const validDeals = (allDeals || []).filter((d: any) => {
    if (!d.product || seenProducts.has(d.product.id)) return false;
    seenProducts.add(d.product.id);
    return true;
  });

  // 2. Fetch All Products in Category (for the secondary section)
  let productsQuery = supabase
      .from('products')
      .select('*')
      .eq('categoria', categorySearchTerm);

  if (minPrice) productsQuery = productsQuery.gte('precio_individual', Number(minPrice));
  if (maxPrice) productsQuery = productsQuery.lte('precio_individual', Number(maxPrice));

  if (sort === "price_asc") {
    productsQuery = productsQuery.order('precio_individual', { ascending: true }).order('id', { ascending: true });
  } else if (sort === "price_desc") {
    productsQuery = productsQuery.order('precio_individual', { ascending: false }).order('id', { ascending: true });
  } else {
    productsQuery = productsQuery.order('creado_en', { ascending: false }).order('id', { ascending: true });
  }

  const { data: allProducts, error: productsError } = await productsQuery;

  // Filtrar productos que YA están mostrados como ofertas
  const secondaryProducts = (allProducts || []).filter(p => !validDeals.some(d => d.product.id === p.id));

  const categoryConfigs: Record<string, { gradient: string, image: string }> = {
      "tecnologia": { gradient: "from-blue-950/90 via-blue-900/40 to-transparent", image: "/images/categories/tecnologia.png" },
      "moda": { gradient: "from-rose-950/90 via-pink-900/40 to-transparent", image: "/images/categories/moda.png" },
      "alimentos": { gradient: "from-green-950/90 via-emerald-900/40 to-transparent", image: "/images/categories/alimentos.png" },
      "hogar": { gradient: "from-orange-950/90 via-amber-900/40 to-transparent", image: "/images/categories/hogar.png" },
      "deportes": { gradient: "from-red-950/90 via-orange-900/40 to-transparent", image: "/images/categories/deportes.png" },
      "belleza": { gradient: "from-purple-950/90 via-indigo-900/40 to-transparent", image: "/images/categories/belleza.png" },
      "juguetes": { gradient: "from-amber-900/90 via-yellow-800/40 to-transparent", image: "/images/categories/juguetes.png" },
      "herramientas": { gradient: "from-slate-950/90 via-gray-900/40 to-transparent", image: "/images/categories/herramientas.png" },
  };

  const config = categoryConfigs[category?.slug || ""] || { gradient: "from-slate-900/80 to-gray-950/90", image: "" };
  const description = category?.description || "Explorá todas las ofertas de esta categoría.";

  return (
    <div className="min-h-screen bg-[#FFF8E7] pb-20">
      {/* Category Hero */}
      <section className={`w-full pt-12 pb-20 px-4 md:px-6 relative overflow-hidden h-[450px] md:h-[550px] flex items-center`}>
        {/* Background Image */}
        {config.image && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={config.image} 
              alt={categoryDisplayName}
              fill
              className="object-cover object-right md:object-center"
              priority
              quality={100}
            />
            {/* Dynamic Overlay based on category color */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} z-10`} />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al Inicio
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none animate-in fade-in slide-in-from-left-4 duration-700">
              {categoryDisplayName}
            </h1>
            <p className="text-white/80 text-lg md:text-2xl font-medium max-w-xl animate-in fade-in slide-in-from-left-6 duration-1000 delay-100">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-30">
        
        <CategoryToolbar totalResults={validDeals.length} />

        {/* Primary Grid: Active Deals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 min-h-[200px]">
           {validDeals.length === 0 ? (
             <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-2">
                    {dealsError ? "Error al cargar ofertas" : "No hay ofertas activas"}
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    {dealsError ? "Estamos trabajando para solucionarlo." : "¡Sé el primero en pedir un producto de esta categoría!"}
                </p>
             </div>
           ) : (
             validDeals.map((deal: any) => (
                <div key={deal.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ProductCard deal={deal} />
                </div>
             ))
           )}
        </div>

        {/* Secondary Grid: Individual Products without active deals */}
        {secondaryProducts.length > 0 && (
            <div className="mt-20">
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-8 pl-2 border-l-4 border-gray-800">Todos los productos en {categoryDisplayName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {secondaryProducts.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
