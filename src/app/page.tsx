import React from "react";
import Link from "next/link";
import { 
  Users, 
  Timer, 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  Gamepad2,
  Shirt,
  Apple,
  Home as HomeIcon,
  Dumbbell,
  Sparkles,
  Puzzle,
  MoreHorizontal,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CountdownTimer from "@/components/shared/CountdownTimer";
import HeroCarousel from "@/components/home/HeroCarousel";
import SocialProof from "@/components/home/SocialProof";
import FlashSale from "@/components/home/FlashSale";
import ProductCard from "@/components/home/ProductCard";
import BenefitsBar from "@/components/home/BenefitsBar";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch active group deals
  const { data: allDeals } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .order('creado_en', { ascending: false });

  // Filtrar ofertas que no tengan producto asociado (evitar crashes)
  const validDeals = (allDeals || []).filter((d: any) => d.product !== null);

  // Logic for Hero Carousel: Sort by "least missing people"
  const dealsForCarousel = validDeals
    ? [...validDeals]
        .sort((a, b) => (a.min_participantes - a.participantes_actuales) - (b.min_participantes - b.participantes_actuales))
        .slice(0, 5)
    : [];

  const flashSaleDeal = dealsForCarousel[0];

  // Deals for the grid
  const deals = validDeals?.slice(0, 8) || [];

  // Fetch individual products (featured)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(8)
    .order('creado_en', { ascending: false });

  const categories = [
    { name: "Electrónica", icon: <Gamepad2 size={24} />, color: "text-blue-500" },
    { name: "Ropa", icon: <Shirt size={24} />, color: "text-pink-500" },
    { name: "Alimentos", icon: <Apple size={24} />, color: "text-green-500" },
    { name: "Hogar", icon: <HomeIcon size={24} />, color: "text-orange-500" },
    { name: "Deportes", icon: <Dumbbell size={24} />, color: "text-red-500" },
    { name: "Belleza", icon: <Sparkles size={24} />, color: "text-purple-500" },
    { name: "Juguetes", icon: <Puzzle size={24} />, color: "text-yellow-500" },
    { name: "Otros", icon: <MoreHorizontal size={24} />, color: "text-gray-500" },
  ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20">
      
      {/* SECCIÓN 1 — Banner hero */}
      <section className="relative w-full overflow-hidden bg-white md:bg-transparent px-4 sm:px-6 md:px-0">
        <div className="max-w-7xl mx-auto md:mt-8">
          <div className="relative w-full h-[300px] md:h-[450px] rounded-none md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#009EE3] to-[#00A650] flex items-center shadow-2xl shadow-[#009EE3]/20">
            {/* Background pattern/elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFF8E7] rounded-full -ml-32 -mb-32 blur-2xl"></div>
            </div>

            <div className="relative z-10 px-8 md:px-20 max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tighter">
                Comprá en grupo y pagá menos
              </h1>
              <p className="text-white/90 text-lg md:text-2xl mb-8 font-medium">
                Cuantos más somos, más ahorramos
              </p>
              <Link 
                href="/productos"
                className="inline-flex items-center gap-3 bg-white text-[#00A650] font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-gray-50 transition-all text-sm md:text-lg uppercase tracking-tight group"
              >
                Ver ofertas grupales
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Visual element (Carousel of deals about to close) */}
            <div className="hidden lg:flex absolute right-10 xl:right-20 top-1/2 -translate-y-1/2 w-[400px] xl:w-[450px] items-center justify-center transform rotate-2">
               <HeroCarousel deals={dealsForCarousel} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1.2 — Beneficios y Medios de Pago */}
      <BenefitsBar />

      {/* SECCIÓN 1.5 — Social Proof Ticker */}
      <SocialProof />

      {/* SECCIÓN 2 — Categorías destacadas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            Categorías
          </h2>
        </div>
        
        {/* Horizontal scroll on mobile */}
        <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar no-scrollbar">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              href={`/categoria/${encodeURIComponent(cat.name)}`}
              className="group cursor-pointer flex flex-col items-center gap-4 p-5 bg-white rounded-3xl border border-transparent shadow-sm hover:shadow-xl hover:shadow-[#009EE3]/5 transition-all min-w-[120px] sm:min-w-0"
            >
              <div className={`w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-center group-hover:text-gray-800 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2.5 — Flash Sale del Día */}
      {flashSaleDeal && <FlashSale deal={flashSaleDeal} />}

      {/* SECCIÓN 3 — Ofertas grupales activas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009EE3]/10 rounded-2xl flex items-center justify-center text-[#009EE3]">
              <Timer className="animate-pulse" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter">Ofertas grupales activas</h2>
          </div>
          <Link href="/productos" className="group text-sm text-[#009EE3] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
            Ver todas <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {!deals || deals.length === 0 ? (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pronto habrá nuevas ofertas grupales...</p>
            </div>
          ) : deals.map((deal: any) => (
            <ProductCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* SECCIÓN 4 — Productos destacados */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter mb-10">Más productos destacados</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts?.map((product: any) => (
            <Link 
              href={`/productos/${product.id}`}
              key={product.id}
              className="bg-white rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200 transition-all border border-gray-50 group"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                <img 
                  src={product.imagen_principal || "/placeholder-product.jpg"} 
                  alt={product.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-snug group-hover:text-[#009EE3] transition-colors">{product.nombre}</h4>
              <p className="font-black text-lg text-gray-900 tracking-tight">${product.precio_individual.toLocaleString()}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Llega gratis mañana</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works Banner */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-20 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight tracking-tighter uppercase">¿Cómo funciona BANDHA?</h2>
            <div className="grid grid-cols-1 gap-6">
              {[
                { step: "1", title: "Elegí tu oferta", text: "Buscá el producto que necesitás entre cientos de ofertas grupales activas." },
                { step: "2", title: "Unite al grupo", text: "Sumate a otros compradores para llegar al precio mayorista." },
                { step: "3", title: "Recibilo en tu casa", text: "Una vez que el grupo se completa, el proveedor envía tu pedido." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex-shrink-0 flex items-center justify-center text-[#009EE3] font-black">{item.step}</div>
                  <div>
                    <h5 className="font-black text-gray-800 uppercase tracking-tight mb-1">{item.title}</h5>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-sm bg-gray-50 rounded-[4rem] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
               <Truck size={120} className="text-[#009EE3] opacity-20 transform -rotate-12" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#009EE3]/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
